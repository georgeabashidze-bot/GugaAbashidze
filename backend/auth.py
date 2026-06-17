"""JWT authentication for SmartPaw Food.

Supports two user types in the same `users` collection:
  - role="admin"     → seeded from .env (single admin), uses Bearer token via /api/admin/login.
  - role="customer"  → self-registered, uses httpOnly cookies via /api/auth/*.

The Bearer-token admin flow is retained for backwards compatibility.
Customers authenticate via httpOnly access + refresh cookies.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_DAYS = 7  # admin bearer token TTL (kept for parity)
ACCESS_COOKIE_TTL_MINUTES = 60 * 24  # 1 day for customer access cookie
REFRESH_COOKIE_TTL_DAYS = 30  # customer refresh cookie
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

ACCESS_COOKIE_NAME = "sp_access"
REFRESH_COOKIE_NAME = "sp_refresh"

bearer_scheme = HTTPBearer(auto_error=False)


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ---- Token creation ----
def create_access_token(user_id: str, email: str, role: str = "admin", ttl_days: int = ACCESS_TOKEN_TTL_DAYS) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=ttl_days),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def create_customer_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": "customer",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_COOKIE_TTL_MINUTES),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_COOKIE_TTL_DAYS),
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str, expected_type: str = "access") -> dict:
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != expected_type:
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Cookie helpers ----
def set_auth_cookies(response: Response, user_id: str, email: str) -> None:
    access = create_customer_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    # secure=True works behind HTTPS (preview + production). samesite=lax allows top-level navigation.
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_COOKIE_TTL_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=REFRESH_COOKIE_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/")
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")


# ---- Brute force protection (per email+ip) ----
async def is_locked_out(db, identifier: str) -> Optional[int]:
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if not rec:
        return None
    if rec.get("count", 0) < MAX_FAILED_ATTEMPTS:
        return None
    locked_until_iso = rec.get("locked_until")
    if not locked_until_iso:
        return None
    try:
        locked_until = datetime.fromisoformat(locked_until_iso)
    except ValueError:
        return None
    now = datetime.now(timezone.utc)
    if locked_until > now:
        return int((locked_until - now).total_seconds())
    await db.login_attempts.delete_one({"identifier": identifier})
    return None


async def record_failed_attempt(db, identifier: str) -> None:
    rec = await db.login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) if rec else 0) + 1
    update = {"count": count, "last_attempt": datetime.now(timezone.utc).isoformat()}
    if count >= MAX_FAILED_ATTEMPTS:
        update["locked_until"] = (
            datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
        ).isoformat()
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {"$set": {"identifier": identifier, **update}},
        upsert=True,
    )


async def clear_failed_attempts(db, identifier: str) -> None:
    await db.login_attempts.delete_one({"identifier": identifier})


# ---- Token extraction ----
def _bearer_token(request: Request, creds: Optional[HTTPAuthorizationCredentials]) -> Optional[str]:
    if creds and creds.scheme.lower() == "bearer" and creds.credentials:
        return creds.credentials
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def _cookie_token(request: Request) -> Optional[str]:
    return request.cookies.get(ACCESS_COOKIE_NAME)


# ---- Dependencies ----
async def get_current_admin(
    request: Request,
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Admin-only dependency. Accepts Bearer header (legacy admin login) or cookie (admin signed in via /api/auth/login)."""
    from server import db  # local import to avoid circular

    token = _bearer_token(request, creds) or _cookie_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = await db.users.find_one({"email": payload.get("email")})
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return {
        "id": user.get("id"),
        "email": user["email"],
        "role": user.get("role", "admin"),
        "name": user.get("name", "Admin"),
    }


async def get_current_user(request: Request) -> dict:
    """Any authenticated user (admin or customer) via httpOnly cookie."""
    from server import db

    token = _cookie_token(request) or _bearer_token(request, None)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),
        "role": user.get("role", "customer"),
        "created_at": user.get("created_at"),
    }


async def get_optional_user(request: Request) -> Optional[dict]:
    """Returns user dict if signed in, else None. Never raises 401."""
    token = _cookie_token(request) or _bearer_token(request, None)
    if not token:
        return None
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
    from server import db
    user = await db.users.find_one({"id": payload.get("sub")})
    if not user:
        return None
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "customer"),
    }


# ---- Admin seeding ----
async def seed_admin(db) -> None:
    """Idempotent admin seed. Re-hash if .env password has changed."""
    admin_email = os.environ["ADMIN_EMAIL"].strip().lower()
    admin_password = os.environ["ADMIN_PASSWORD"]

    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Admin",
                "phone": "",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        return

    updates = {}
    if not verify_password(admin_password, existing.get("password_hash", "")):
        updates["password_hash"] = hash_password(admin_password)
    if existing.get("role") != "admin":
        updates["role"] = "admin"
    if updates:
        await db.users.update_one({"email": admin_email}, {"$set": updates})


def client_identifier(request: Request, email: str) -> str:
    xff = request.headers.get("x-forwarded-for", "").strip()
    if xff:
        ip = xff.split(",")[0].strip() or "unknown"
    else:
        ip = request.client.host if request.client else "unknown"
    return f"{ip}:{email.lower().strip()}"
