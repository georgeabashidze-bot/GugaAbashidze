"""SmartPaw Product Requests — "Request a product" inbox.

Customers (signed-in or anonymous) can submit a request when a product isn't
yet in the SmartPaw catalogue. Requests are emailed to the admin via Resend
and surface in:
  - /admin/product-requests       (admin sees all)
  - /cabinet/requests             (each customer sees their own)

Schema (MongoDB collection `product_requests`):
  {
    request_id   : str (UUID),
    user_id      : str | null (set when the customer is signed-in),
    name         : str   - customer name (required),
    email        : str   - customer email (required for anonymous),
    phone        : str | null,
    product_name : str   - product the customer wants,
    brand        : str | null,
    size         : str | null,
    quantity     : int   - default 1,
    notes        : str | null,
    photo        : str | null   - data URL (base64) if uploaded,
    status       : "pending" | "sourced" | "ordered" | "declined",
    status_note  : str | null,
    created_at   : datetime (UTC),
    updated_at   : datetime (UTC),
  }
"""
from __future__ import annotations

import asyncio
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, EmailStr, Field

import resend

from auth import get_current_admin, get_optional_user

logger = logging.getLogger("smartpaw.requests")

requests_router = APIRouter(prefix="/api", tags=["product-requests"])

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", "")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _db():
    from server import db
    return db


def _serialize(doc: dict) -> dict:
    if not doc:
        return {}
    out = {}
    for k, v in doc.items():
        if k == "_id":
            continue
        if isinstance(v, datetime):
            out[k] = v.astimezone(timezone.utc).isoformat()
        else:
            out[k] = v
    return out


async def _notify_admin_new_request(doc: dict) -> None:
    if not resend.api_key or not ADMIN_NOTIFY_EMAIL:
        return
    try:
        html = f"""
        <div style="font-family:DM Sans, Arial, sans-serif; max-width:560px; margin:0 auto;
                    padding:24px; background:#FDFBF7; color:#05223D;">
          <h2 style="margin:0 0 8px;">New product request</h2>
          <p style="margin:0 0 16px; color:#5c6470;">A customer wants a product
          that isn't in the catalogue yet.</p>
          <div style="background:#fff; border:1px solid #eadfce; border-radius:14px; padding:16px;">
            <p style="margin:0 0 8px;"><strong>From:</strong> {doc.get('name','')} &lt;{doc.get('email','')}&gt;</p>
            {"<p style='margin:0 0 8px;'><strong>Phone:</strong> " + (doc.get('phone') or '') + "</p>" if doc.get('phone') else ""}
            <p style="margin:0 0 8px;"><strong>Product:</strong> {doc.get('product_name','')}</p>
            {"<p style='margin:0 0 8px;'><strong>Brand:</strong> " + (doc.get('brand') or '—') + "</p>" if doc.get('brand') else ""}
            {"<p style='margin:0 0 8px;'><strong>Size:</strong> " + (doc.get('size') or '—') + "</p>" if doc.get('size') else ""}
            <p style="margin:0 0 8px;"><strong>Quantity:</strong> {doc.get('quantity', 1)}</p>
            {"<p style='margin:0 0 8px;'><strong>Notes:</strong> " + (doc.get('notes') or '') + "</p>" if doc.get('notes') else ""}
          </div>
          <p style="margin-top:18px; font-size:12px; color:#8a8f99;">
            Request ID {doc.get('request_id')} · {now_utc().isoformat()}.
          </p>
        </div>
        """
        params = {
            "from": f"SmartPaw <{SENDER_EMAIL}>",
            "to": [ADMIN_NOTIFY_EMAIL],
            "subject": f"Product request — {doc.get('product_name','(unspecified)')} from {doc.get('name','customer')}",
            "html": html,
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Product-request email sent: %s", result.get("id") if isinstance(result, dict) else result)
    except Exception as e:  # noqa: BLE001
        logger.warning("Resend product-request notification failed: %s", e)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ProductRequestCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    phone: Optional[str] = None
    product_name: str = Field(min_length=1, max_length=200)
    brand: Optional[str] = None
    size: Optional[str] = None
    quantity: int = Field(default=1, ge=1, le=20)
    notes: Optional[str] = None
    photo: Optional[str] = None   # base64 data URL


class ProductRequestStatusUpdate(BaseModel):
    status: Literal["pending", "sourced", "ordered", "declined"]
    status_note: Optional[str] = None


# ---------------------------------------------------------------------------
# Public submit endpoint
# ---------------------------------------------------------------------------
@requests_router.post("/product-requests")
async def submit_product_request(
    body: ProductRequestCreate,
    request: Request,
    user: Optional[dict] = Depends(get_optional_user),
):
    db = _db()
    doc = {
        "request_id": f"req_{uuid.uuid4().hex[:12]}",
        "user_id": user["id"] if user else None,
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "phone": body.phone,
        "product_name": body.product_name.strip(),
        "brand": body.brand,
        "size": body.size,
        "quantity": body.quantity,
        "notes": body.notes,
        "photo": body.photo,
        "status": "pending",
        "status_note": None,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await db.product_requests.insert_one(doc)
    asyncio.create_task(_notify_admin_new_request(doc))
    return _serialize(doc)


# ---------------------------------------------------------------------------
# Customer self-service: their own requests
# ---------------------------------------------------------------------------
@requests_router.get("/product-requests/mine")
async def my_product_requests(user: Optional[dict] = Depends(get_optional_user)):
    if not user:
        raise HTTPException(401, "Sign-in required")
    db = _db()
    items = (
        await db.product_requests.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [_serialize(d) for d in items]


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------
@requests_router.get("/admin/product-requests")
async def admin_list_product_requests(_=Depends(get_current_admin)):
    db = _db()
    items = (
        await db.product_requests.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(5000)
    )
    return [_serialize(d) for d in items]


@requests_router.patch("/admin/product-requests/{request_id}")
async def admin_update_request_status(
    request_id: str,
    body: ProductRequestStatusUpdate,
    _=Depends(get_current_admin),
):
    db = _db()
    res = await db.product_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": body.status,
            "status_note": body.status_note,
            "updated_at": now_utc(),
        }},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Request not found")
    updated = await db.product_requests.find_one({"request_id": request_id}, {"_id": 0})
    return _serialize(updated)


@requests_router.get("/admin/product-requests/stats")
async def admin_request_stats(_=Depends(get_current_admin)):
    db = _db()
    total = await db.product_requests.count_documents({})
    pending = await db.product_requests.count_documents({"status": "pending"})
    sourced = await db.product_requests.count_documents({"status": "sourced"})
    return {"total": total, "pending": pending, "sourced": sourced}
