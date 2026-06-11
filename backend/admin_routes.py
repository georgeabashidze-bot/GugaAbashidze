"""Admin API routes for SmartPaw Food.

Mounted at /api/admin/* — all endpoints (except login) require Bearer JWT
issued by /api/admin/login.
"""

from __future__ import annotations

import os
import uuid
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl

from auth import (
    client_identifier,
    create_access_token,
    clear_failed_attempts,
    get_current_admin,
    is_locked_out,
    record_failed_attempt,
    verify_password,
)


admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


# ============================================================================
# AUTH
# ============================================================================
class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_days: int = 7
    user: dict


@admin_router.post("/login", response_model=LoginResponse)
async def admin_login(payload: LoginPayload, request: Request):
    from server import db

    email = payload.email.lower().strip()
    identifier = client_identifier(request, email)

    remaining = await is_locked_out(db, identifier)
    if remaining:
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed attempts. Try again in {remaining // 60 + 1} minute(s).",
        )

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await record_failed_attempt(db, identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin account")

    await clear_failed_attempts(db, identifier)
    token = create_access_token(user.get("id", ""), email, "admin")
    return LoginResponse(
        access_token=token,
        user={
            "id": user.get("id"),
            "email": email,
            "name": user.get("name", "Admin"),
            "role": "admin",
        },
    )


@admin_router.get("/me")
async def admin_me(current=Depends(get_current_admin)):
    return current


# ============================================================================
# PRODUCT MODELS (bilingual)
# ============================================================================
SLUG_RE = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    base = SLUG_RE.sub("-", text.lower()).strip("-")
    return base or f"product-{uuid.uuid4().hex[:8]}"


class ProductIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: Optional[str] = None
    name: str = Field(min_length=1, max_length=200)
    name_ka: Optional[str] = Field(default=None, max_length=200)
    brand: str = Field(min_length=1, max_length=120)
    category: str = Field(pattern=r"^(catalogue|specials)$")
    sub_category: str = Field(min_length=1, max_length=60)
    pet_type: str = Field(default="both", pattern=r"^(dog|cat|both)$")
    image: str = Field(min_length=1)
    description: str = Field(min_length=1, max_length=4000)
    description_ka: Optional[str] = Field(default=None, max_length=4000)
    size: Optional[str] = Field(default=None, max_length=120)
    price: Optional[float] = Field(default=None, ge=0)
    currency: str = Field(default='GEL', max_length=8)
    tags: List[str] = Field(default_factory=list)
    featured: bool = False
    status: str = Field(default="published", pattern=r"^(draft|published)$")


class ProductOut(ProductIn):
    id: str
    created_at: str
    updated_at: Optional[str] = None


def _product_doc_to_out(doc: dict) -> ProductOut:
    return ProductOut(
        id=doc["id"],
        slug=doc["slug"],
        name=doc["name"],
        name_ka=doc.get("name_ka"),
        brand=doc["brand"],
        category=doc["category"],
        sub_category=doc["sub_category"],
        pet_type=doc.get("pet_type", "both"),
        image=doc["image"],
        description=doc["description"],
        description_ka=doc.get("description_ka"),
        size=doc.get("size"),
        price=doc.get("price"),
        currency=doc.get("currency", "GEL"),
        tags=doc.get("tags", []),
        featured=doc.get("featured", False),
        status=doc.get("status", "published"),
        created_at=doc.get("created_at", ""),
        updated_at=doc.get("updated_at"),
    )


# ============================================================================
# PRODUCTS CRUD
# ============================================================================
@admin_router.get("/products", response_model=List[ProductOut])
async def admin_list_products(
    category: Optional[str] = None,
    sub_category: Optional[str] = None,
    q: Optional[str] = None,
    _=Depends(get_current_admin),
):
    from server import db

    query: dict = {}
    if category:
        query["category"] = category
    if sub_category:
        query["sub_category"] = sub_category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"slug": {"$regex": q, "$options": "i"}},
        ]

    docs = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [_product_doc_to_out(d) for d in docs]


@admin_router.post("/products", response_model=ProductOut, status_code=201)
async def admin_create_product(payload: ProductIn, _=Depends(get_current_admin)):
    from server import db

    slug = (payload.slug or slugify(payload.name)).lower()
    existing = await db.products.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=409, detail=f"Slug '{slug}' already exists")

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "name": payload.name,
        "name_ka": payload.name_ka,
        "brand": payload.brand,
        "category": payload.category,
        "sub_category": payload.sub_category,
        "pet_type": payload.pet_type,
        "image": payload.image,
        "description": payload.description,
        "description_ka": payload.description_ka,
        "size": payload.size,
        "price": payload.price,
        "currency": payload.currency,
        "tags": payload.tags,
        "featured": payload.featured,
        "status": payload.status,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return _product_doc_to_out(doc)


@admin_router.put("/products/{product_id}", response_model=ProductOut)
async def admin_update_product(
    product_id: str, payload: ProductIn, _=Depends(get_current_admin)
):
    from server import db

    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    new_slug = (payload.slug or slugify(payload.name)).lower()
    if new_slug != existing["slug"]:
        clash = await db.products.find_one({"slug": new_slug, "id": {"$ne": product_id}})
        if clash:
            raise HTTPException(status_code=409, detail=f"Slug '{new_slug}' already exists")

    update_doc = {
        "slug": new_slug,
        "name": payload.name,
        "name_ka": payload.name_ka,
        "brand": payload.brand,
        "category": payload.category,
        "sub_category": payload.sub_category,
        "pet_type": payload.pet_type,
        "image": payload.image,
        "description": payload.description,
        "description_ka": payload.description_ka,
        "size": payload.size,
        "price": payload.price,
        "currency": payload.currency,
        "tags": payload.tags,
        "featured": payload.featured,
        "status": payload.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.products.update_one({"id": product_id}, {"$set": update_doc})
    merged = {**existing, **update_doc}
    merged.pop("_id", None)
    return _product_doc_to_out(merged)


@admin_router.delete("/products/{product_id}", status_code=204)
async def admin_delete_product(product_id: str, _=Depends(get_current_admin)):
    from server import db

    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return None


# ============================================================================
# SPECIAL OFFERS CRUD
# ============================================================================
class SpecialOfferIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: Optional[str] = None
    title: str = Field(min_length=1, max_length=200)
    title_ka: Optional[str] = Field(default=None, max_length=200)
    description: str = Field(min_length=1, max_length=4000)
    description_ka: Optional[str] = Field(default=None, max_length=4000)
    image: str = Field(min_length=1)
    badge: Optional[str] = Field(default=None, max_length=80)
    discount_percent: Optional[int] = Field(default=None, ge=0, le=100)
    original_price: Optional[float] = Field(default=None, ge=0)
    sale_price: Optional[float] = Field(default=None, ge=0)
    sub_category: Optional[str] = Field(
        default=None,
        pattern=r"^(toys-accessories|innovation-tech|services)$",
    )
    linked_product_slug: Optional[str] = Field(default=None, max_length=200)
    starts_at: Optional[str] = None  # ISO 8601
    ends_at: Optional[str] = None
    status: str = Field(default="published", pattern=r"^(draft|published)$")
    order: int = 100


class SpecialOfferOut(SpecialOfferIn):
    id: str
    created_at: str
    updated_at: Optional[str] = None


def _offer_doc_to_out(doc: dict) -> SpecialOfferOut:
    return SpecialOfferOut(
        id=doc["id"],
        slug=doc["slug"],
        title=doc["title"],
        title_ka=doc.get("title_ka"),
        description=doc["description"],
        description_ka=doc.get("description_ka"),
        image=doc["image"],
        badge=doc.get("badge"),
        discount_percent=doc.get("discount_percent"),
        original_price=doc.get("original_price"),
        sale_price=doc.get("sale_price"),
        sub_category=doc.get("sub_category"),
        linked_product_slug=doc.get("linked_product_slug"),
        starts_at=doc.get("starts_at"),
        ends_at=doc.get("ends_at"),
        status=doc.get("status", "published"),
        order=doc.get("order", 100),
        created_at=doc.get("created_at", ""),
        updated_at=doc.get("updated_at"),
    )


@admin_router.get("/special-offers", response_model=List[SpecialOfferOut])
async def admin_list_offers(_=Depends(get_current_admin)):
    from server import db

    docs = (
        await db.special_offers.find({}, {"_id": 0})
        .sort([("order", 1), ("created_at", -1)])
        .to_list(500)
    )
    return [_offer_doc_to_out(d) for d in docs]


@admin_router.post("/special-offers", response_model=SpecialOfferOut, status_code=201)
async def admin_create_offer(payload: SpecialOfferIn, _=Depends(get_current_admin)):
    from server import db

    slug = (payload.slug or slugify(payload.title)).lower()
    existing = await db.special_offers.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=409, detail=f"Slug '{slug}' already exists")

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = payload.model_dump()
    doc.update(
        {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "created_at": now_iso,
            "updated_at": now_iso,
        }
    )
    await db.special_offers.insert_one(doc)
    doc.pop("_id", None)
    return _offer_doc_to_out(doc)


@admin_router.put("/special-offers/{offer_id}", response_model=SpecialOfferOut)
async def admin_update_offer(
    offer_id: str, payload: SpecialOfferIn, _=Depends(get_current_admin)
):
    from server import db

    existing = await db.special_offers.find_one({"id": offer_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Special offer not found")

    new_slug = (payload.slug or slugify(payload.title)).lower()
    if new_slug != existing["slug"]:
        clash = await db.special_offers.find_one(
            {"slug": new_slug, "id": {"$ne": offer_id}}
        )
        if clash:
            raise HTTPException(status_code=409, detail=f"Slug '{new_slug}' already exists")

    update_doc = payload.model_dump()
    update_doc["slug"] = new_slug
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.special_offers.update_one({"id": offer_id}, {"$set": update_doc})
    merged = {**existing, **update_doc}
    merged.pop("_id", None)
    return _offer_doc_to_out(merged)


@admin_router.delete("/special-offers/{offer_id}", status_code=204)
async def admin_delete_offer(offer_id: str, _=Depends(get_current_admin)):
    from server import db

    res = await db.special_offers.delete_one({"id": offer_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Special offer not found")
    return None


# ============================================================================
# FILE UPLOADS (images)
# ============================================================================
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
MAX_UPLOAD_BYTES = 6 * 1024 * 1024  # 6 MB


class UploadResponse(BaseModel):
    url: str
    filename: str
    size: int


@admin_router.post("/uploads", response_model=UploadResponse)
async def admin_upload_image(
    request: Request,
    file: UploadFile = File(...),
    _=Depends(get_current_admin),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400, detail=f"Unsupported file type. Allowed: {sorted(ALLOWED_EXT)}"
        )

    upload_dir = Path(os.environ.get("UPLOAD_DIR", "/app/backend/uploads"))
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest = upload_dir / safe_name

    # Stream copy with size guard
    size = 0
    with dest.open("wb") as out:
        while True:
            chunk = await file.read(64 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                out.close()
                dest.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File too large (max 6 MB)")
            out.write(chunk)

    # Build absolute URL. Prefer PUBLIC_BASE_URL (set to the user-facing origin),
    # then X-Forwarded-Proto+Host (set by the ingress), then request.base_url as a
    # last resort. Behind k8s ingress request.base_url resolves to the internal
    # cluster hostname which mixes http with the public https site.
    public_base = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
    if not public_base:
        fwd_proto = request.headers.get("x-forwarded-proto")
        fwd_host = request.headers.get("x-forwarded-host")
        if fwd_proto and fwd_host:
            public_base = f"{fwd_proto}://{fwd_host}"
    if not public_base:
        public_base = str(request.base_url).rstrip("/")
    public_url = f"{public_base}/api/uploads/{safe_name}"
    return UploadResponse(url=public_url, filename=safe_name, size=size)


# ============================================================================
# LEADS / CONTACTS (read-only — full editor in A6)
# ============================================================================
@admin_router.get("/leads")
async def admin_list_leads(_=Depends(get_current_admin)):
    from server import db

    items = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items


@admin_router.get("/contact-inquiries")
async def admin_list_contacts(_=Depends(get_current_admin)):
    from server import db

    items = (
        await db.contact_inquiries.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(2000)
    )
    return items
