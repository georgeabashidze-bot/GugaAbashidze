"""
SmartPaw Customer Cabinet — unified backend routes.

All endpoints are mounted under /api/* and share the same MongoDB / auth as the
main smartpaw.ge site (see auth.py). Customer authentication uses the existing
httpOnly cookie helpers (`set_auth_cookies`, `get_current_user`).

Collections used (all UUID-keyed):
    users               (id, email, password_hash, role, name, phone, picture, provider, created_at)
    pets                (pet_id, user_id, ...)
    addresses           (address_id, user_id, ...)
    subscriptions       (subscription_id, user_id, ...)
    orders              (order_id, user_id, ...)
    notification_prefs  (user_id, ...)
    cabinet_offers      (offer_id, slug, ...)
    products            (managed by legacy admin — single source of truth)
"""
from __future__ import annotations

import asyncio
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Literal, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, EmailStr, Field

import resend
from auth import (
    clear_auth_cookies,
    get_current_user,
    hash_password,
    set_auth_cookies,
    verify_password,
)

logger = logging.getLogger("smartpaw.cabinet")

cabinet_router = APIRouter(prefix="/api", tags=["cabinet"])

# ------------------------------------------------------------------------------- #
# Constants
# ------------------------------------------------------------------------------- #
EMERGENT_SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
MAX_SUBSCRIPTIONS_PER_USER = 3
FREQ_DELTA = {
    "weekly": timedelta(days=7),
    "biweekly": timedelta(days=14),
    "monthly": timedelta(days=30),
}

# Resend email (admin notifications on new registration)
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", "")


# ------------------------------------------------------------------------------- #
# Helpers
# ------------------------------------------------------------------------------- #
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def gen_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def serialize_doc(doc):
    """Strip _id and serialize datetimes to ISO strings (recursively)."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(x) for x in doc]
    if not isinstance(doc, dict):
        if isinstance(doc, datetime):
            return doc.astimezone(timezone.utc).isoformat()
        return doc
    out = {}
    for k, v in doc.items():
        if k == "_id":
            continue
        if isinstance(v, datetime):
            out[k] = v.astimezone(timezone.utc).isoformat()
        elif isinstance(v, dict):
            out[k] = serialize_doc(v)
        elif isinstance(v, list):
            out[k] = [
                serialize_doc(x)
                if isinstance(x, (dict, list))
                else (x.isoformat() if isinstance(x, datetime) else x)
                for x in v
            ]
        else:
            out[k] = v
    return out


def public_user(u: dict) -> dict:
    """Customer-safe projection of a user document."""
    if not u:
        return {}
    return serialize_doc(
        {
            "id": u.get("id"),
            "email": u.get("email"),
            "name": u.get("name", ""),
            "phone": u.get("phone", ""),
            "picture": u.get("picture"),
            "provider": u.get("provider", "email"),
            "role": u.get("role", "customer"),
            "created_at": u.get("created_at"),
        }
    )


async def _notify_admin_new_user(user_doc: dict, address: Optional[dict] = None,
                                 pet: Optional[dict] = None, subs: Optional[list] = None) -> None:
    """Fire-and-forget Resend email when a new customer registers."""
    if not resend.api_key or not ADMIN_NOTIFY_EMAIL:
        return
    try:
        sub_summary = ""
        if subs:
            lines = []
            for s in subs:
                items_n = len(s.get("items", []))
                lines.append(
                    f"<li>{s.get('label') or '(unnamed)'} — "
                    f"{s.get('frequency')} — {items_n} item(s)</li>"
                )
            sub_summary = "<ul>" + "".join(lines) + "</ul>"
        pet_summary = ""
        if pet and pet.get("name"):
            extras = f" • {pet.get('breed')}" if pet.get("breed") else ""
            pet_summary = (
                f"<p><strong>Pet:</strong> {pet.get('name')} "
                f"({pet.get('species', 'pet')}{extras})</p>"
            )
        addr_summary = ""
        if address and address.get("street"):
            addr_summary = (
                f"<p><strong>Address:</strong> {address.get('city','')}, "
                f"{address.get('district','') or ''} — {address.get('street','')}</p>"
            )
        html = f"""
        <div style="font-family:DM Sans, Arial, sans-serif; max-width:560px; margin:0 auto;
                    padding:24px; background:#FDFBF7; color:#05223D;">
          <h2 style="margin:0 0 8px;">New SmartPaw cabinet registration</h2>
          <p style="margin:0 0 16px; color:#5c6470;">A new customer just signed up.</p>
          <div style="background:#fff; border:1px solid #eadfce; border-radius:14px; padding:16px;">
            <p style="margin:0 0 8px;"><strong>Name:</strong> {user_doc.get('name','')}</p>
            <p style="margin:0 0 8px;"><strong>Email:</strong> {user_doc.get('email','')}</p>
            <p style="margin:0 0 8px;"><strong>Phone:</strong> {user_doc.get('phone','') or '—'}</p>
            <p style="margin:0 0 8px;"><strong>Provider:</strong> {user_doc.get('provider','email')}</p>
            {addr_summary}
            {pet_summary}
            {f"<p style='margin:8px 0 0;'><strong>Subscriptions:</strong></p>{sub_summary}" if sub_summary else ""}
          </div>
          <p style="margin-top:18px; font-size:12px; color:#8a8f99;">
            Sent automatically from SmartPaw cabinet at {now_utc().isoformat()}.
          </p>
        </div>
        """
        params = {
            "from": f"SmartPaw <{SENDER_EMAIL}>",
            "to": [ADMIN_NOTIFY_EMAIL],
            "subject": (
                f"New SmartPaw registration — "
                f"{user_doc.get('name','')} ({user_doc.get('email','')})"
            ),
            "html": html,
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(
            "Admin notification sent: %s",
            result.get("id") if isinstance(result, dict) else result,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning("Admin notification failed: %s", e)


# ------------------------------------------------------------------------------- #
# Models
# ------------------------------------------------------------------------------- #
class StarterAddress(BaseModel):
    model_config = ConfigDict(extra="ignore")

    label: str = "Home"
    recipient: Optional[str] = None
    phone: Optional[str] = None
    city: str = "Tbilisi"
    district: Optional[str] = None
    street: str
    building: Optional[str] = None
    apartment: Optional[str] = None
    postal_code: Optional[str] = None
    notes: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class StarterPet(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    species: Literal["dog", "cat"] = "dog"
    breed: Optional[str] = None
    birth_date: Optional[str] = None
    approx_age: Optional[str] = None
    weight_kg: Optional[float] = None
    photo_url: Optional[str] = None
    birth_certificate_url: Optional[str] = None
    dietary_notes: Optional[str] = None
    quiz: Optional[dict] = None


class SubscriptionItemIn(BaseModel):
    product_id: str
    qty: int = Field(ge=1, le=20)


class StarterSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")

    frequency: Literal["weekly", "biweekly", "monthly"] = "biweekly"
    items: List[SubscriptionItemIn] = Field(default_factory=list)
    first_delivery_at: Optional[str] = None
    label: Optional[str] = None
    payment_method: Literal["bank_transfer", "cash_on_delivery"] = "bank_transfer"


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    phone: Optional[str] = None
    address: Optional[StarterAddress] = None
    pet: Optional[StarterPet] = None
    subscriptions: Optional[List[StarterSubscription]] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionBody(BaseModel):
    session_id: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class PetIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    species: Literal["dog", "cat"]
    breed: Optional[str] = None
    birth_date: Optional[str] = None
    approx_age: Optional[str] = None
    weight_kg: Optional[float] = None
    photo_url: Optional[str] = None
    birth_certificate_url: Optional[str] = None
    dietary_notes: Optional[str] = None
    quiz: Optional[dict] = None


class AddressIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    label: str = "Home"
    recipient: str
    phone: str
    city: str = "Tbilisi"
    district: Optional[str] = None
    street: str
    building: Optional[str] = None
    apartment: Optional[str] = None
    postal_code: Optional[str] = None
    notes: Optional[str] = None
    is_default: bool = False
    lat: Optional[float] = None
    lng: Optional[float] = None


class SubscriptionCreate(BaseModel):
    frequency: Literal["weekly", "biweekly", "monthly"] = "biweekly"
    delivery_address_id: Optional[str] = None
    items: List[SubscriptionItemIn] = Field(default_factory=list)
    first_delivery_at: Optional[str] = None
    label: Optional[str] = None
    payment_method: Literal["bank_transfer", "cash_on_delivery"] = "bank_transfer"


class SubscriptionUpdate(BaseModel):
    frequency: Optional[Literal["weekly", "biweekly", "monthly"]] = None
    delivery_address_id: Optional[str] = None
    items: Optional[List[SubscriptionItemIn]] = None
    label: Optional[str] = None
    next_delivery_at: Optional[str] = None
    payment_method: Optional[Literal["bank_transfer", "cash_on_delivery"]] = None


class NotificationPrefs(BaseModel):
    email_enabled: bool = True
    sms_enabled: bool = True
    whatsapp_enabled: bool = True
    delivery_reminders: bool = True
    low_stock_alerts: bool = True
    marketing: bool = True


# ------------------------------------------------------------------------------- #
# Helpers (db access through lazy import to avoid circular)
# ------------------------------------------------------------------------------- #
def _db():
    from server import db
    return db


async def ensure_user_defaults(user_id: str) -> None:
    db = _db()
    if not await db.notification_prefs.find_one({"user_id": user_id}):
        await db.notification_prefs.insert_one(
            {
                "user_id": user_id,
                **NotificationPrefs().model_dump(),
                "updated_at": now_utc(),
            }
        )


async def _create_starter_data(
    user_id: str,
    *,
    address: Optional[dict],
    pet: Optional[dict],
    subscriptions: Optional[List[dict]],
    default_phone: Optional[str],
) -> None:
    db = _db()
    addr_id = None
    if address and (address.get("street") or address.get("city")):
        addr_id = gen_id("addr")
        recipient = address.get("recipient") or "Customer"
        phone = address.get("phone") or default_phone or ""
        await db.addresses.insert_one(
            {
                "address_id": addr_id,
                "user_id": user_id,
                "label": address.get("label") or "Home",
                "recipient": recipient,
                "phone": phone,
                "city": address.get("city") or "Tbilisi",
                "district": address.get("district"),
                "street": address.get("street") or "",
                "building": address.get("building"),
                "apartment": address.get("apartment"),
                "postal_code": address.get("postal_code"),
                "notes": address.get("notes"),
                "lat": address.get("lat"),
                "lng": address.get("lng"),
                "is_default": True,
                "created_at": now_utc(),
            }
        )

    if pet and pet.get("name"):
        await db.pets.insert_one(
            {
                "pet_id": gen_id("pet"),
                "user_id": user_id,
                "name": pet.get("name"),
                "species": pet.get("species") or "dog",
                "breed": pet.get("breed"),
                "birth_date": pet.get("birth_date"),
                "approx_age": pet.get("approx_age"),
                "weight_kg": pet.get("weight_kg"),
                "photo_url": pet.get("photo_url"),
                "birth_certificate_url": pet.get("birth_certificate_url"),
                "dietary_notes": pet.get("dietary_notes"),
                "quiz": pet.get("quiz") or None,
                "created_at": now_utc(),
            }
        )

    if subscriptions:
        for sub in subscriptions[:MAX_SUBSCRIPTIONS_PER_USER]:
            items = sub.get("items") or []
            if not items:
                continue
            freq = sub.get("frequency") or "biweekly"
            first_delivery = sub.get("first_delivery_at")
            try:
                first_dt = (
                    datetime.fromisoformat(first_delivery)
                    if first_delivery
                    else (now_utc() + timedelta(days=5))
                )
                if first_dt.tzinfo is None:
                    first_dt = first_dt.replace(tzinfo=timezone.utc)
            except Exception:  # noqa: BLE001
                first_dt = now_utc() + timedelta(days=5)
            await db.subscriptions.insert_one(
                {
                    "subscription_id": gen_id("sub"),
                    "user_id": user_id,
                    "status": "active",
                    "frequency": freq,
                    "items": [
                        {"product_id": it["product_id"], "qty": it["qty"]}
                        for it in items
                    ],
                    "delivery_address_id": addr_id,
                    "next_delivery_at": first_dt,
                    "created_at": now_utc(),
                    "paused_until": None,
                    "label": sub.get("label"),
                    "payment_method": sub.get("payment_method") or "bank_transfer",
                }
            )


# =============================================================================== #
# AUTH
# =============================================================================== #
@cabinet_router.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    db = _db()
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": email,
        "name": body.name.strip(),
        "password_hash": hash_password(body.password),
        "phone": body.phone or "",
        "picture": None,
        "provider": "email",
        "role": "customer",
        "created_at": now_utc().isoformat(),
    }
    await db.users.insert_one(user_doc)
    await ensure_user_defaults(user_id)

    await _create_starter_data(
        user_id,
        address=body.address.model_dump() if body.address else None,
        pet=body.pet.model_dump() if body.pet else None,
        subscriptions=(
            [s.model_dump() for s in body.subscriptions] if body.subscriptions else None
        ),
        default_phone=body.phone,
    )

    set_auth_cookies(response, user_id, email)

    # Fire-and-forget admin notification
    asyncio.create_task(
        _notify_admin_new_user(
            user_doc=user_doc,
            address=body.address.model_dump() if body.address else None,
            pet=body.pet.model_dump() if body.pet else None,
            subs=(
                [s.model_dump() for s in body.subscriptions]
                if body.subscriptions
                else None
            ),
        )
    )

    return public_user(user_doc)


@cabinet_router.post("/auth/login")
async def login(body: LoginBody, response: Response):
    db = _db()
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_auth_cookies(response, user["id"], email)
    return public_user(user)


@cabinet_router.post("/auth/google/session")
async def google_session(body: GoogleSessionBody, response: Response):
    db = _db()
    async with httpx.AsyncClient(timeout=15) as http:
        r = await http.get(
            EMERGENT_SESSION_DATA_URL,
            headers={"X-Session-ID": body.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Could not exchange Google session")
    info = r.json()
    email = (info.get("email") or "").lower().strip()
    name = info.get("name") or email.split("@")[0]
    picture = info.get("picture")
    if not email:
        raise HTTPException(status_code=400, detail="Google session missing email")

    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["id"]
        provider = existing.get("provider", "email")
        new_provider = "both" if provider == "email" else "google"
        await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "name": existing.get("name") or name,
                    "picture": picture or existing.get("picture"),
                    "provider": new_provider,
                }
            },
        )
        user_doc = await db.users.find_one({"id": user_id})
    else:
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "password_hash": None,
            "provider": "google",
            "role": "customer",
            "phone": "",
            "created_at": now_utc().isoformat(),
        }
        await db.users.insert_one(user_doc)
        await ensure_user_defaults(user_id)
        asyncio.create_task(_notify_admin_new_user(user_doc=user_doc))

    set_auth_cookies(response, user_id, email)
    return public_user(user_doc)


@cabinet_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@cabinet_router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


# =============================================================================== #
# PROFILE
# =============================================================================== #
@cabinet_router.patch("/users/me")
async def update_profile(body: UserUpdate, user: dict = Depends(get_current_user)):
    db = _db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    updated = await db.users.find_one({"id": user["id"]})
    return public_user(updated)


# =============================================================================== #
# PETS
# =============================================================================== #
@cabinet_router.get("/pets")
async def list_pets(user: dict = Depends(get_current_user)):
    db = _db()
    docs = (
        await db.pets.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", 1)
        .to_list(200)
    )
    return [serialize_doc(d) for d in docs]


@cabinet_router.post("/pets")
async def create_pet(body: PetIn, user: dict = Depends(get_current_user)):
    db = _db()
    pet_id = gen_id("pet")
    doc = {
        **body.model_dump(),
        "pet_id": pet_id,
        "user_id": user["id"],
        "created_at": now_utc(),
    }
    await db.pets.insert_one(doc)
    out = await db.pets.find_one({"pet_id": pet_id}, {"_id": 0})
    return serialize_doc(out)


@cabinet_router.patch("/pets/{pet_id}")
async def update_pet(pet_id: str, body: PetIn, user: dict = Depends(get_current_user)):
    db = _db()
    res = await db.pets.update_one(
        {"pet_id": pet_id, "user_id": user["id"]},
        {"$set": body.model_dump()},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")
    out = await db.pets.find_one({"pet_id": pet_id}, {"_id": 0})
    return serialize_doc(out)


@cabinet_router.delete("/pets/{pet_id}")
async def delete_pet(pet_id: str, user: dict = Depends(get_current_user)):
    db = _db()
    res = await db.pets.delete_one({"pet_id": pet_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")
    return {"ok": True}


# =============================================================================== #
# ADDRESSES
# =============================================================================== #
@cabinet_router.get("/addresses")
async def list_addresses(user: dict = Depends(get_current_user)):
    db = _db()
    docs = (
        await db.addresses.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", 1)
        .to_list(200)
    )
    return [serialize_doc(d) for d in docs]


@cabinet_router.post("/addresses")
async def create_address(body: AddressIn, user: dict = Depends(get_current_user)):
    db = _db()
    addr_id = gen_id("addr")
    is_first = await db.addresses.count_documents({"user_id": user["id"]}) == 0
    payload = body.model_dump()
    payload["is_default"] = payload.get("is_default") or is_first
    if payload["is_default"]:
        await db.addresses.update_many(
            {"user_id": user["id"]}, {"$set": {"is_default": False}}
        )
    doc = {
        **payload,
        "address_id": addr_id,
        "user_id": user["id"],
        "created_at": now_utc(),
    }
    await db.addresses.insert_one(doc)
    out = await db.addresses.find_one({"address_id": addr_id}, {"_id": 0})
    return serialize_doc(out)


@cabinet_router.patch("/addresses/{address_id}")
async def update_address(
    address_id: str, body: AddressIn, user: dict = Depends(get_current_user)
):
    db = _db()
    payload = body.model_dump()
    if payload.get("is_default"):
        await db.addresses.update_many(
            {"user_id": user["id"]}, {"$set": {"is_default": False}}
        )
    res = await db.addresses.update_one(
        {"address_id": address_id, "user_id": user["id"]}, {"$set": payload}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    out = await db.addresses.find_one({"address_id": address_id}, {"_id": 0})
    return serialize_doc(out)


@cabinet_router.post("/addresses/{address_id}/default")
async def set_default_address(
    address_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    target = await db.addresses.find_one(
        {"address_id": address_id, "user_id": user["id"]}
    )
    if not target:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.addresses.update_many(
        {"user_id": user["id"]}, {"$set": {"is_default": False}}
    )
    await db.addresses.update_one(
        {"address_id": address_id}, {"$set": {"is_default": True}}
    )
    docs = await db.addresses.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    return [serialize_doc(d) for d in docs]


@cabinet_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(get_current_user)):
    db = _db()
    res = await db.addresses.delete_one(
        {"address_id": address_id, "user_id": user["id"]}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    remaining = await db.addresses.find_one({"user_id": user["id"]}, {"_id": 0})
    if remaining and not await db.addresses.find_one(
        {"user_id": user["id"], "is_default": True}
    ):
        await db.addresses.update_one(
            {"address_id": remaining["address_id"]}, {"$set": {"is_default": True}}
        )
    return {"ok": True}


# =============================================================================== #
# PRODUCTS (cabinet-friendly view of the legacy db.products collection)
# =============================================================================== #
def _legacy_product_to_cabinet(p: dict) -> dict:
    """Adapt legacy product schema to the shape cabinet pages expect."""
    sub_cat = (p.get("sub_category") or p.get("category") or "food").lower()
    if sub_cat not in ("food", "hygiene", "vitamins"):
        sub_cat_lower = sub_cat
        if "vitamin" in sub_cat_lower or "supplement" in sub_cat_lower:
            sub_cat = "vitamins"
        elif (
            "hygiene" in sub_cat_lower
            or "litter" in sub_cat_lower
            or "shampoo" in sub_cat_lower
        ):
            sub_cat = "hygiene"
        else:
            sub_cat = "food"
    pet_type = (p.get("pet_type") or "both").lower()
    if pet_type not in ("dog", "cat", "both"):
        pet_type = "both"
    return {
        "product_id": p.get("id") or p.get("slug"),
        "slug": p.get("slug"),
        "category": sub_cat,
        "brand": p.get("brand") or "",
        "name_en": p.get("name") or "",
        "name_ka": p.get("name_ka") or p.get("name") or "",
        "description_en": p.get("description") or "",
        "description_ka": p.get("description_ka") or p.get("description") or "",
        "price_gel": float(p.get("price") or 0),
        "suitable_for": pet_type,
        "weight": p.get("size") or "",
        "image_url": p.get("image") or "",
        "stock": 100,
        "tags": p.get("tags") or [],
        "featured": bool(p.get("featured")),
    }


@cabinet_router.get("/cabinet/products")
async def cabinet_list_products(
    category: Optional[str] = None, suitable_for: Optional[str] = None
):
    """
    Cabinet-formatted product list (sourced from the same db.products the
    main site admin manages — single source of truth).
    """
    db = _db()
    raw = (
        await db.products.find(
            {"status": "published"}, {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(500)
    )
    mapped = [_legacy_product_to_cabinet(p) for p in raw]
    if category:
        mapped = [p for p in mapped if p["category"] == category]
    if suitable_for and suitable_for != "both":
        mapped = [p for p in mapped if p["suitable_for"] in (suitable_for, "both")]
    return mapped


# =============================================================================== #
# OFFERS (cabinet-only — stored in db.cabinet_offers; admin can manage later)
# =============================================================================== #
@cabinet_router.get("/cabinet/offers")
async def list_cabinet_offers():
    db = _db()
    docs = (
        await db.cabinet_offers.find({"is_active": True}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(100)
    )
    # Resolve referenced products to their cabinet-shaped representation.
    raw_products = await db.products.find({}, {"_id": 0}).to_list(500)
    products_by_slug = {p["slug"]: _legacy_product_to_cabinet(p) for p in raw_products}
    out = []
    for o in docs:
        items_detail = []
        for slug in o.get("product_slugs", []):
            p = products_by_slug.get(slug)
            if p:
                items_detail.append(
                    {
                        "product_id": p["product_id"],
                        "slug": slug,
                        "name_en": p["name_en"],
                        "name_ka": p["name_ka"],
                        "image_url": p["image_url"],
                        "price_gel": p["price_gel"],
                        "qty": o.get("qty_per_slug", {}).get(slug, 1),
                    }
                )
        out.append({**serialize_doc(o), "items": items_detail})
    return out


@cabinet_router.post(
    "/subscriptions/{subscription_id}/add-offer/{offer_id}"
)
async def add_offer_to_subscription(
    subscription_id: str, offer_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    sub = await db.subscriptions.find_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    offer = await db.cabinet_offers.find_one(
        {"offer_id": offer_id, "is_active": True}
    )
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    slugs = offer.get("product_slugs", [])
    if slugs:
        prods = await db.products.find({"slug": {"$in": slugs}}, {"_id": 0}).to_list(50)
        slug_to_id = {p["slug"]: (p.get("id") or p.get("slug")) for p in prods}
        items = list(sub.get("items", []))
        qty_map = offer.get("qty_per_slug", {})
        for slug in slugs:
            product_id = slug_to_id.get(slug)
            if not product_id:
                continue
            add_qty = qty_map.get(slug, 1)
            existing = next((it for it in items if it["product_id"] == product_id), None)
            if existing:
                existing["qty"] = min(20, existing["qty"] + add_qty)
            else:
                items.append({"product_id": product_id, "qty": add_qty})
        await db.subscriptions.update_one(
            {"subscription_id": subscription_id}, {"$set": {"items": items}}
        )
    applied = list(sub.get("applied_offers", []))
    applied.append(
        {
            "offer_id": offer_id,
            "slug": offer.get("slug"),
            "applied_at": now_utc().isoformat(),
        }
    )
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id}, {"$set": {"applied_offers": applied}}
    )

    out = await db.subscriptions.find_one(
        {"subscription_id": subscription_id}, {"_id": 0}
    )
    return serialize_doc(out)


# =============================================================================== #
# SUBSCRIPTIONS (multi)
# =============================================================================== #
@cabinet_router.get("/subscriptions")
async def list_subscriptions(user: dict = Depends(get_current_user)):
    db = _db()
    docs = (
        await db.subscriptions.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", 1)
        .to_list(50)
    )
    return [serialize_doc(d) for d in docs]


@cabinet_router.post("/subscriptions")
async def create_subscription(
    body: SubscriptionCreate, user: dict = Depends(get_current_user)
):
    db = _db()
    count = await db.subscriptions.count_documents(
        {"user_id": user["id"], "status": {"$ne": "cancelled"}}
    )
    if count >= MAX_SUBSCRIPTIONS_PER_USER:
        raise HTTPException(
            status_code=400,
            detail=f"You can have at most {MAX_SUBSCRIPTIONS_PER_USER} active subscriptions",
        )
    addr_id = body.delivery_address_id
    if not addr_id:
        default_addr = await db.addresses.find_one(
            {"user_id": user["id"], "is_default": True}, {"_id": 0}
        )
        addr_id = (default_addr or {}).get("address_id")
    try:
        first_dt = (
            datetime.fromisoformat(body.first_delivery_at)
            if body.first_delivery_at
            else (now_utc() + timedelta(days=5))
        )
        if first_dt.tzinfo is None:
            first_dt = first_dt.replace(tzinfo=timezone.utc)
    except Exception:  # noqa: BLE001
        first_dt = now_utc() + timedelta(days=5)
    doc = {
        "subscription_id": gen_id("sub"),
        "user_id": user["id"],
        "status": "active",
        "frequency": body.frequency,
        "items": [i.model_dump() for i in body.items],
        "delivery_address_id": addr_id,
        "next_delivery_at": first_dt,
        "created_at": now_utc(),
        "paused_until": None,
        "label": body.label,
        "payment_method": body.payment_method,
    }
    await db.subscriptions.insert_one(doc)
    out = await db.subscriptions.find_one(
        {"subscription_id": doc["subscription_id"]}, {"_id": 0}
    )
    return serialize_doc(out)


@cabinet_router.get("/subscriptions/{subscription_id}")
async def get_subscription_by_id(
    subscription_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    doc = await db.subscriptions.find_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return serialize_doc(doc)


@cabinet_router.patch("/subscriptions/{subscription_id}")
async def update_subscription(
    subscription_id: str,
    body: SubscriptionUpdate,
    user: dict = Depends(get_current_user),
):
    db = _db()
    sub = await db.subscriptions.find_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    update = {}
    if body.frequency:
        update["frequency"] = body.frequency
    if body.delivery_address_id is not None:
        update["delivery_address_id"] = body.delivery_address_id
    if body.items is not None:
        update["items"] = [i.model_dump() for i in body.items]
    if body.label is not None:
        update["label"] = body.label
    if body.payment_method is not None:
        update["payment_method"] = body.payment_method
    if body.next_delivery_at:
        try:
            dt = datetime.fromisoformat(body.next_delivery_at)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            update["next_delivery_at"] = dt
        except Exception:  # noqa: BLE001
            pass
    if update:
        await db.subscriptions.update_one(
            {"subscription_id": subscription_id}, {"$set": update}
        )
    out = await db.subscriptions.find_one(
        {"subscription_id": subscription_id}, {"_id": 0}
    )
    return serialize_doc(out)


@cabinet_router.post("/subscriptions/{subscription_id}/pause")
async def pause_subscription(
    subscription_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    sub = await db.subscriptions.find_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "paused",
                "paused_until": now_utc() + timedelta(days=30),
            }
        },
    )
    out = await db.subscriptions.find_one(
        {"subscription_id": subscription_id}, {"_id": 0}
    )
    return serialize_doc(out)


@cabinet_router.post("/subscriptions/{subscription_id}/resume")
async def resume_subscription(
    subscription_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    sub = await db.subscriptions.find_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    freq = sub.get("frequency", "biweekly")
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "active",
                "paused_until": None,
                "next_delivery_at": now_utc()
                + FREQ_DELTA.get(freq, timedelta(days=14)),
            }
        },
    )
    out = await db.subscriptions.find_one(
        {"subscription_id": subscription_id}, {"_id": 0}
    )
    return serialize_doc(out)


@cabinet_router.post("/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    sub = await db.subscriptions.find_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {"$set": {"status": "cancelled", "next_delivery_at": None}},
    )
    out = await db.subscriptions.find_one(
        {"subscription_id": subscription_id}, {"_id": 0}
    )
    return serialize_doc(out)


@cabinet_router.delete("/subscriptions/{subscription_id}")
async def delete_subscription(
    subscription_id: str, user: dict = Depends(get_current_user)
):
    db = _db()
    res = await db.subscriptions.delete_one(
        {"subscription_id": subscription_id, "user_id": user["id"]}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"ok": True}


# Legacy single-subscription convenience endpoint (kept for backwards compat)
@cabinet_router.get("/subscription")
async def get_subscription_legacy(user: dict = Depends(get_current_user)):
    db = _db()
    doc = await db.subscriptions.find_one(
        {"user_id": user["id"]}, {"_id": 0}, sort=[("created_at", 1)]
    )
    return serialize_doc(doc) if doc else None


# =============================================================================== #
# ORDERS
# =============================================================================== #
@cabinet_router.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    db = _db()
    docs = (
        await db.orders.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [serialize_doc(d) for d in docs]


@cabinet_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    db = _db()
    doc = await db.orders.find_one(
        {"order_id": order_id, "user_id": user["id"]}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(doc)


# =============================================================================== #
# NOTIFICATION PREFS
# =============================================================================== #
@cabinet_router.get("/notifications/prefs")
async def get_prefs(user: dict = Depends(get_current_user)):
    db = _db()
    doc = await db.notification_prefs.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    if not doc:
        defaults = NotificationPrefs().model_dump()
        await db.notification_prefs.insert_one(
            {"user_id": user["id"], **defaults, "updated_at": now_utc()}
        )
        doc = await db.notification_prefs.find_one(
            {"user_id": user["id"]}, {"_id": 0}
        )
    return serialize_doc(doc)


@cabinet_router.patch("/notifications/prefs")
async def update_prefs(
    body: NotificationPrefs, user: dict = Depends(get_current_user)
):
    db = _db()
    await db.notification_prefs.update_one(
        {"user_id": user["id"]},
        {"$set": {**body.model_dump(), "updated_at": now_utc()}},
        upsert=True,
    )
    doc = await db.notification_prefs.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    return serialize_doc(doc)
