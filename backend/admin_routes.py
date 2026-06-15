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
    status as http_status,
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


# Allowed product_type values per sub_category
FOOD_TYPE_VALUES = ("dry-food", "wet-food", "snacks", "other")
HYGIENE_TYPE_VALUES = ("teeth-care", "grooming", "pads", "other")


def _normalize_product_type(sub_category: str, raw: Optional[str]) -> Optional[str]:
    """Return a valid product_type or None. Silently drops invalid values
    or values not applicable to the chosen sub_category."""
    if not raw:
        return None
    value = str(raw).strip().lower()
    if not value:
        return None
    if sub_category == "food" and value in FOOD_TYPE_VALUES:
        return value
    if sub_category == "hygiene" and value in HYGIENE_TYPE_VALUES:
        return value
    return None


class ProductIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: Optional[str] = None
    name: str = Field(min_length=1, max_length=200)
    name_ka: Optional[str] = Field(default=None, max_length=200)
    brand: str = Field(min_length=1, max_length=120)
    category: str = Field(pattern=r"^(catalogue|specials)$")
    sub_category: str = Field(min_length=1, max_length=60)
    product_type: Optional[str] = Field(default=None, max_length=40)
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
        product_type=doc.get("product_type") or None,
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
    status: Optional[str] = None,  # "draft" | "published"
    brand: Optional[str] = None,
    source: Optional[str] = None,  # e.g. "bewital_pricelist"
    needs_enrichment: Optional[bool] = None,
    limit: int = 1000,
    _=Depends(get_current_admin),
):
    from server import db

    query: dict = {}
    if category:
        query["category"] = category
    if sub_category:
        query["sub_category"] = sub_category
    if status:
        query["status"] = status
    if brand:
        query["brand"] = brand
    if source:
        query["source"] = source
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"slug": {"$regex": q, "$options": "i"}},
        ]
    if needs_enrichment is True:
        # Missing KA name OR KA description OR a very short EN description
        # (heuristic mirroring services.llm_enrichment.needs_enrichment).
        and_clause = [
            {
                "$or": [
                    {"name_ka": {"$in": [None, ""]}},
                    {"description_ka": {"$in": [None, ""]}},
                    {"$expr": {"$lt": [{"$strLenCP": {"$ifNull": ["$description", ""]}}, 30]}},
                ]
            }
        ]
        if "$or" in query:
            # Preserve the search $or by wrapping both in $and
            query["$and"] = [{"$or": query.pop("$or")}, *and_clause]
        else:
            query.update(and_clause[0])

    docs = (
        await db.products.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(max(1, min(int(limit), 5000)))
    )
    return [_product_doc_to_out(d) for d in docs]


@admin_router.get("/products/summary")
async def admin_products_summary(_=Depends(get_current_admin)):
    """Aggregate counts so the admin UI can render status / brand badges
    without pulling the full product list."""
    from server import db

    pipeline_status = [
        {"$group": {"_id": "$status", "n": {"$sum": 1}}},
    ]
    pipeline_brand = [
        {"$group": {"_id": {"brand": "$brand", "status": "$status"}, "n": {"$sum": 1}}},
    ]
    pipeline_source = [
        {"$group": {"_id": "$source", "n": {"$sum": 1}}},
    ]

    status_counts: dict = {"draft": 0, "published": 0, "total": 0}
    async for row in db.products.aggregate(pipeline_status):
        key = row["_id"] or "published"
        status_counts[key] = row["n"]
        status_counts["total"] += row["n"]

    by_brand: list = []
    async for row in db.products.aggregate(pipeline_brand):
        by_brand.append(
            {
                "brand": (row["_id"] or {}).get("brand") or "Unknown",
                "status": (row["_id"] or {}).get("status") or "published",
                "count": row["n"],
            }
        )

    by_source: dict = {}
    async for row in db.products.aggregate(pipeline_source):
        by_source[row["_id"] or "manual"] = row["n"]

    needs_enrichment_count = await db.products.count_documents(
        {
            "$or": [
                {"name_ka": {"$in": [None, ""]}},
                {"description_ka": {"$in": [None, ""]}},
                {
                    "$expr": {
                        "$lt": [
                            {"$strLenCP": {"$ifNull": ["$description", ""]}},
                            30,
                        ]
                    }
                },
            ]
        }
    )

    return {
        "status_counts": status_counts,
        "by_brand": sorted(by_brand, key=lambda r: (r["brand"], r["status"])),
        "by_source": by_source,
        "needs_enrichment": needs_enrichment_count,
    }


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
        "product_type": _normalize_product_type(payload.sub_category, payload.product_type),
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
        "product_type": _normalize_product_type(payload.sub_category, payload.product_type),
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
# BEWITAL PARTNER CATALOGUE IMPORT (one-click)
# ============================================================================
class BewitalImportResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    total_parsed: int
    inserted: int
    updated: int = 0
    skipped: int = 0
    by_brand: dict = Field(default_factory=dict)
    by_pet_type: dict = Field(default_factory=dict)
    llm_failures: list = Field(default_factory=list)
    llm_failure_count: int = 0
    dry_run: bool = False
    status_used: str = "draft"
    currency: str = "GEL"


@admin_router.post("/products/import/bewital", response_model=BewitalImportResponse)
async def admin_import_bewital(
    dry_run: bool = False,
    limit: Optional[int] = None,
    _=Depends(get_current_admin),
):
    """Run the Bewital partner-catalogue enrichment pipeline.

    - Parses /app/backend/scripts/data/bewital_pricelist.xlsx
    - Enriches every row with EN + KA name/description/tags via Emergent LLM
    - Inserts new products as status='draft' in GEL; skips slugs that already exist
    """
    from server import db
    from scripts.import_bewital_catalogue import run_import

    try:
        summary = await run_import(db, dry_run=dry_run, limit=limit)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Bewital import failed: {e}")
    return BewitalImportResponse(**summary)


# ============================================================================
# BULK PRODUCT ACTIONS (publish / delete / enrich)
# ============================================================================
class BulkIdsPayload(BaseModel):
    ids: List[str] = Field(min_length=1, max_length=1000)


class BulkEnrichPayload(BulkIdsPayload):
    overwrite: bool = False


class BulkPublishResponse(BaseModel):
    matched: int
    modified: int
    status: str


class BulkDeleteResponse(BaseModel):
    deleted: int


class EnrichJobAccepted(BaseModel):
    job_id: str
    total: int
    skipped_already_enriched: int


@admin_router.post("/products/bulk-publish", response_model=BulkPublishResponse)
async def admin_bulk_publish(payload: BulkIdsPayload, _=Depends(get_current_admin)):
    from server import db

    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db.products.update_many(
        {"id": {"$in": payload.ids}},
        {"$set": {"status": "published", "updated_at": now_iso}},
    )
    return BulkPublishResponse(
        matched=res.matched_count, modified=res.modified_count, status="published"
    )


@admin_router.post("/products/bulk-unpublish", response_model=BulkPublishResponse)
async def admin_bulk_unpublish(payload: BulkIdsPayload, _=Depends(get_current_admin)):
    from server import db

    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db.products.update_many(
        {"id": {"$in": payload.ids}},
        {"$set": {"status": "draft", "updated_at": now_iso}},
    )
    return BulkPublishResponse(
        matched=res.matched_count, modified=res.modified_count, status="draft"
    )


@admin_router.post("/products/bulk-delete", response_model=BulkDeleteResponse)
async def admin_bulk_delete(payload: BulkIdsPayload, _=Depends(get_current_admin)):
    from server import db

    res = await db.products.delete_many({"id": {"$in": payload.ids}})
    return BulkDeleteResponse(deleted=res.deleted_count)


# ----- AI BULK ENRICHMENT (background job) ----------------------------------
async def _run_enrich_job(job_id: str, ids: List[str], overwrite: bool) -> None:
    """Background coroutine — iterates ids, calls Emergent LLM per product,
    persists updates and per-item progress to ``admin_jobs``.

    Concurrency is kept low (3) to stay friendly to the LLM-key budget and to
    Mongo. Each item is processed inside its own try/except so one failure
    cannot crash the whole job.
    """
    import asyncio  # local import: avoid module-level cycle

    from server import db
    from services.job_store import (
        append_failure,
        bump_progress,
        complete_job,
        fail_job,
        set_running,
    )
    from services.llm_enrichment import enrich_product_doc, needs_enrichment

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        await fail_job(db, job_id, error="EMERGENT_LLM_KEY missing from backend/.env")
        return

    await set_running(db, job_id)
    sem = asyncio.Semaphore(3)

    async def _one(pid: str) -> None:
        async with sem:
            product = await db.products.find_one({"id": pid}, {"_id": 0})
            if not product:
                await append_failure(db, job_id, item_id=pid, error="not_found")
                await bump_progress(db, job_id, failed=1, last_message=f"missing {pid}")
                return
            if not overwrite and not needs_enrichment(product):
                await bump_progress(
                    db, job_id, skipped=1, last_message=f"skip {product.get('name')[:40]}"
                )
                return

            update = await enrich_product_doc(api_key, product)
            if not update.get("llm_ok"):
                await append_failure(
                    db, job_id, item_id=pid, error=update.get("llm_error") or "llm_failed"
                )
                await bump_progress(
                    db, job_id, failed=1, last_message=f"err {product.get('name')[:40]}"
                )
                return

            # Strip helper flags before persisting
            persist = {k: v for k, v in update.items() if k not in ("llm_ok", "llm_error")}
            persist["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.products.update_one({"id": pid}, {"$set": persist})
            await bump_progress(
                db, job_id, succeeded=1, last_message=f"ok {product.get('name')[:40]}"
            )

    try:
        await asyncio.gather(*[_one(pid) for pid in ids])
        await complete_job(db, job_id)
    except Exception as exc:  # noqa: BLE001
        await fail_job(db, job_id, error=f"job crashed: {exc}")


@admin_router.post(
    "/products/enrich-bulk",
    response_model=EnrichJobAccepted,
    status_code=202,
)
async def admin_bulk_enrich(
    payload: BulkEnrichPayload, _=Depends(get_current_admin)
):
    """Kick off AI enrichment for the given product IDs as a background job.

    Returns a job_id immediately; poll ``GET /api/admin/jobs/{job_id}`` for
    progress. Idempotent: products that already have EN+KA descriptions are
    skipped unless ``overwrite=true``.
    """
    import asyncio

    from server import db
    from services.job_store import create_job
    from services.llm_enrichment import needs_enrichment

    # Pre-scan: figure out how many would actually be enriched so the UI can
    # warn the operator before starting.
    cursor = db.products.find(
        {"id": {"$in": payload.ids}}, {"_id": 0}
    )
    selected = await cursor.to_list(len(payload.ids))
    found_ids = {p["id"] for p in selected}
    if not found_ids:
        raise HTTPException(status_code=404, detail="No matching products")

    if payload.overwrite:
        skipped = 0
    else:
        skipped = sum(1 for p in selected if not needs_enrichment(p))

    total = len(found_ids)
    job_id = await create_job(
        db,
        kind="enrich-products",
        total=total,
        meta={
            "overwrite": payload.overwrite,
            "requested": len(payload.ids),
            "found": total,
            "pre_skipped": skipped,
        },
    )

    asyncio.create_task(_run_enrich_job(job_id, list(found_ids), payload.overwrite))
    return EnrichJobAccepted(
        job_id=job_id, total=total, skipped_already_enriched=skipped
    )


# ============================================================================
# JOBS (poll long-running admin operations)
# ============================================================================
@admin_router.get("/jobs/{job_id}")
async def admin_get_job(job_id: str, _=Depends(get_current_admin)):
    from server import db
    from services.job_store import get_job

    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@admin_router.get("/jobs")
async def admin_list_jobs(
    kind: Optional[str] = None,
    limit: int = 25,
    _=Depends(get_current_admin),
):
    from server import db

    query: dict = {}
    if kind:
        query["kind"] = kind
    docs = (
        await db.admin_jobs.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(max(1, min(int(limit), 100)))
    )
    return docs


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
# PLANS (subscription tiers) — CRUD
# ============================================================================
class PlanFeature(BaseModel):
    model_config = ConfigDict(extra="ignore")
    en: str = Field(min_length=1, max_length=200)
    ka: Optional[str] = Field(default=None, max_length=200)


class PlanInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=80)
    name_ka: Optional[str] = Field(default=None, max_length=80)
    tagline: str = Field(min_length=1, max_length=400)
    tagline_ka: Optional[str] = Field(default=None, max_length=400)
    price: str = Field(min_length=1, max_length=40)  # "0", "15", "From 79"
    price_suffix: str = Field(default="GEL / month", max_length=80)
    price_suffix_ka: Optional[str] = Field(default=None, max_length=80)
    price_note: Optional[str] = Field(default=None, max_length=200)
    price_note_ka: Optional[str] = Field(default=None, max_length=200)
    features: List[PlanFeature] = Field(default_factory=list, max_length=20)
    cta_label: str = Field(default="Get started", max_length=60)
    cta_label_ka: Optional[str] = Field(default=None, max_length=60)
    badge: Optional[str] = Field(default=None, max_length=40)
    badge_ka: Optional[str] = Field(default=None, max_length=40)
    featured: bool = False
    order: int = 0
    status: str = Field(default="published", pattern=r"^(draft|published)$")


class PlanOut(PlanInput):
    id: str
    created_at: str
    updated_at: str


def _plan_doc_to_out(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "slug": doc.get("slug", ""),
        "name": doc.get("name", ""),
        "name_ka": doc.get("name_ka"),
        "tagline": doc.get("tagline", ""),
        "tagline_ka": doc.get("tagline_ka"),
        "price": doc.get("price", "0"),
        "price_suffix": doc.get("price_suffix", "GEL / month"),
        "price_suffix_ka": doc.get("price_suffix_ka"),
        "price_note": doc.get("price_note"),
        "price_note_ka": doc.get("price_note_ka"),
        "features": doc.get("features", []),
        "cta_label": doc.get("cta_label", "Get started"),
        "cta_label_ka": doc.get("cta_label_ka"),
        "badge": doc.get("badge"),
        "badge_ka": doc.get("badge_ka"),
        "featured": bool(doc.get("featured", False)),
        "order": int(doc.get("order", 0)),
        "status": doc.get("status", "published"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@admin_router.get("/plans")
async def admin_list_plans(_=Depends(get_current_admin)):
    from server import db
    docs = await db.plans.find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)]).to_list(100)
    return [_plan_doc_to_out(d) for d in docs]


@admin_router.get("/plans/{plan_id}")
async def admin_get_plan(plan_id: str, _=Depends(get_current_admin)):
    from server import db
    doc = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Plan not found")
    return _plan_doc_to_out(doc)


@admin_router.post("/plans", status_code=201)
async def admin_create_plan(payload: PlanInput, _=Depends(get_current_admin)):
    from server import db
    existing = await db.plans.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=409, detail="A plan with this slug already exists")
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "features": [f.model_dump() for f in payload.features],
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.plans.insert_one(doc)
    return _plan_doc_to_out(doc)


@admin_router.put("/plans/{plan_id}")
async def admin_update_plan(plan_id: str, payload: PlanInput, _=Depends(get_current_admin)):
    from server import db
    existing = await db.plans.find_one({"id": plan_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Plan not found")
    # slug uniqueness when changed
    if payload.slug != existing.get("slug"):
        clash = await db.plans.find_one({"slug": payload.slug, "id": {"$ne": plan_id}})
        if clash:
            raise HTTPException(status_code=409, detail="Slug already used by another plan")
    update_doc = {
        **payload.model_dump(),
        "features": [f.model_dump() for f in payload.features],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.plans.update_one({"id": plan_id}, {"$set": update_doc})
    merged = {**existing, **update_doc, "id": plan_id}
    return _plan_doc_to_out(merged)


@admin_router.delete("/plans/{plan_id}", status_code=204)
async def admin_delete_plan(plan_id: str, _=Depends(get_current_admin)):
    from server import db
    res = await db.plans.delete_one({"id": plan_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return None


# ============================================================================
# BLOG POSTS — CRUD
# ============================================================================
class BlogPostInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=200)
    title_ka: Optional[str] = Field(default=None, max_length=200)
    excerpt: str = Field(min_length=1, max_length=600)
    excerpt_ka: Optional[str] = Field(default=None, max_length=600)
    content: str = Field(min_length=1)  # markdown
    content_ka: Optional[str] = None
    cover_image: str = Field(default="", max_length=600)
    cover_alt: Optional[str] = Field(default=None, max_length=200)
    tag: Optional[str] = Field(default=None, max_length=60)
    category: Optional[str] = Field(default=None, max_length=60)
    author_name: str = Field(default="SmartPaw Team", max_length=80)
    author_role: Optional[str] = Field(default=None, max_length=80)
    author_avatar: Optional[str] = Field(default=None, max_length=600)
    read_minutes: int = Field(default=4, ge=1, le=60)
    tags: List[str] = Field(default_factory=list, max_length=20)
    seo_title: Optional[str] = Field(default=None, max_length=200)
    seo_description: Optional[str] = Field(default=None, max_length=400)
    published_at: Optional[str] = None  # ISO; auto-set if missing
    status: str = Field(default="published", pattern=r"^(draft|published)$")


def _blog_doc_to_out(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "slug": doc.get("slug", ""),
        "title": doc.get("title", ""),
        "title_ka": doc.get("title_ka"),
        "excerpt": doc.get("excerpt", ""),
        "excerpt_ka": doc.get("excerpt_ka"),
        "content": doc.get("content", ""),
        "content_ka": doc.get("content_ka"),
        "cover_image": doc.get("cover_image", ""),
        "cover_alt": doc.get("cover_alt"),
        "tag": doc.get("tag"),
        "category": doc.get("category"),
        "author_name": doc.get("author_name", "SmartPaw Team"),
        "author_role": doc.get("author_role"),
        "author_avatar": doc.get("author_avatar"),
        "read_minutes": int(doc.get("read_minutes", 4)),
        "tags": doc.get("tags", []),
        "seo_title": doc.get("seo_title"),
        "seo_description": doc.get("seo_description"),
        "published_at": doc.get("published_at", ""),
        "status": doc.get("status", "published"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@admin_router.get("/blog-posts")
async def admin_list_blog(q: Optional[str] = None, _=Depends(get_current_admin)):
    from server import db
    query: dict = {}
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"title": rx}, {"slug": rx}, {"tag": rx}]
    docs = (
        await db.blog_posts.find(query, {"_id": 0})
        .sort("published_at", -1)
        .to_list(500)
    )
    return [_blog_doc_to_out(d) for d in docs]


@admin_router.get("/blog-posts/{post_id}")
async def admin_get_blog(post_id: str, _=Depends(get_current_admin)):
    from server import db
    # try id first, then slug for legacy markdown-seeded posts
    doc = await db.blog_posts.find_one({"$or": [{"id": post_id}, {"slug": post_id}]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return _blog_doc_to_out(doc)


@admin_router.post("/blog-posts", status_code=201)
async def admin_create_blog(payload: BlogPostInput, _=Depends(get_current_admin)):
    from server import db
    existing = await db.blog_posts.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=409, detail="A post with this slug already exists")
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "published_at": payload.published_at or now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.blog_posts.insert_one(doc)
    return _blog_doc_to_out(doc)


@admin_router.put("/blog-posts/{post_id}")
async def admin_update_blog(post_id: str, payload: BlogPostInput, _=Depends(get_current_admin)):
    from server import db
    existing = await db.blog_posts.find_one({"$or": [{"id": post_id}, {"slug": post_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if payload.slug != existing.get("slug"):
        clash = await db.blog_posts.find_one(
            {"slug": payload.slug, "id": {"$ne": existing.get("id", post_id)}}
        )
        if clash:
            raise HTTPException(status_code=409, detail="Slug already used by another post")
    update_doc = {
        **payload.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if not update_doc.get("published_at"):
        update_doc["published_at"] = existing.get("published_at") or update_doc["updated_at"]
    await db.blog_posts.update_one({"id": existing.get("id", post_id)}, {"$set": update_doc})
    merged = {**existing, **update_doc}
    return _blog_doc_to_out(merged)


@admin_router.delete("/blog-posts/{post_id}", status_code=204)
async def admin_delete_blog(post_id: str, _=Depends(get_current_admin)):
    from server import db
    res = await db.blog_posts.delete_one({"$or": [{"id": post_id}, {"slug": post_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return None


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
