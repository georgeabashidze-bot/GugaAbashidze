"""JWT-based admin authentication for SmartPaw Food.

Single-admin model — credentials seeded from environment, brute-force protected,
Bearer-token issued on /api/admin/login.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_DAYS = 7  # single-admin panel — keep simple, no refresh tokens
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

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


def create_access_token(user_id: str, email: str, role: str = "admin") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_TTL_DAYS),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Brute force protection (per email+ip) ----
async def is_locked_out(db, identifier: str) -> Optional[int]:
    """Return remaining lockout seconds, or None if not locked."""
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
    # Lockout expired — clear it
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


# ---- Dependencies ----
def _extract_token(request: Request, creds: Optional[HTTPAuthorizationCredentials]) -> str:
    if creds and creds.scheme.lower() == "bearer" and creds.credentials:
        return creds.credentials
    # Fallback: raw Authorization header
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    raise HTTPException(status_code=401, detail="Not authenticated")


async def get_current_admin(
    request: Request,
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """FastAPI dependency — verifies Bearer token and confirms admin user exists."""
    from server import db  # local import to avoid circular

    token = _extract_token(request, creds)
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


# ---- Admin seeding ----
async def seed_admin(db) -> None:
    """Idempotent admin seed. Re-hash if .env password has changed."""
    import uuid

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
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        return

    if not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


def client_identifier(request: Request, email: str) -> str:
    ip = request.client.host if request.client else "unknown"
    return f"{ip}:{email.lower().strip()}"
