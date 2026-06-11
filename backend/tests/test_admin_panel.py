"""Backend tests for the SmartPaw Food Admin Panel (Phase A1+A2+A3).

Covers:
- JWT login (/api/admin/login), me endpoint, brute-force lockout
- Admin Products CRUD with bilingual fields
- Admin Special Offers CRUD with bilingual fields and date windows
- Public /api/special-offers active-window filtering
- Public /api/products bilingual field exposure
- Admin uploads (multipart image) + size/type validation
- Admin read-only viewers for leads + contact inquiries
"""
from __future__ import annotations

import io
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback to frontend .env for tests run outside the frontend shell
    with open("/app/frontend/.env") as f:
        for ln in f:
            if ln.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = ln.split("=", 1)[1].strip().rstrip("/")
                break

ADMIN_EMAIL = "admin@smartpawfood.com"
ADMIN_PASSWORD = "ChangeMe123!"

PEXELS_IMAGE = "https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=400"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed ({r.status_code}): {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- AUTH ----------
class TestAdminAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert data.get("token_type") == "bearer"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"

    def test_me_without_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me")
        assert r.status_code == 401

    def test_me_with_invalid_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me", headers={"Authorization": "Bearer not-a-real-token"})
        assert r.status_code == 401

    def test_me_with_valid_token(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/me", headers=auth_headers)
        assert r.status_code == 200, r.text
        assert r.json()["email"] == ADMIN_EMAIL

    def test_wrong_password_returns_401(self, api):
        # Use a unique email so we don't pollute the real account's brute-force counter
        unique = f"nobody-{uuid.uuid4().hex[:6]}@example.com"
        r = api.post(f"{BASE_URL}/api/admin/login", json={"email": unique, "password": "wrong"})
        assert r.status_code == 401

    def test_brute_force_lockout_429(self, api):
        # Use a fresh email so we don't lock out the real admin
        unique = f"bf-{uuid.uuid4().hex[:6]}@example.com"
        statuses = []
        for _ in range(6):
            r = api.post(f"{BASE_URL}/api/admin/login", json={"email": unique, "password": "wrong"})
            statuses.append(r.status_code)
        # Expect first 5 to be 401 and at least one 429 after threshold
        assert 429 in statuses, f"Expected 429 lockout after 5 failed attempts, got {statuses}"


# ---------- PRODUCTS CRUD ----------
class TestAdminProducts:
    def test_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/products")
        assert r.status_code == 401

    def test_full_crud_flow(self, api, auth_headers):
        slug = f"test-bilingual-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "name": "TEST Bilingual Product",
            "name_ka": "ტესტი ბილინგვალური",
            "brand": "TestBrand",
            "category": "catalogue",
            "sub_category": "food",
            "pet_type": "dog",
            "image": PEXELS_IMAGE,
            "description": "Test EN",
            "description_ka": "ტესტ KA",
        }
        # CREATE
        r = api.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers)
        assert r.status_code == 201, r.text
        created = r.json()
        product_id = created["id"]
        assert created["name"] == payload["name"]
        assert created["name_ka"] == payload["name_ka"]
        assert created["description_ka"] == payload["description_ka"]
        assert created["slug"] == slug

        # Duplicate slug -> 409
        dup = api.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers)
        assert dup.status_code == 409, dup.text

        # LIST contains product
        lst = api.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        assert lst.status_code == 200
        assert any(p["id"] == product_id for p in lst.json())

        # UPDATE
        upd_payload = {**payload, "name": "TEST Bilingual Updated"}
        upd = api.put(f"{BASE_URL}/api/admin/products/{product_id}", json=upd_payload, headers=auth_headers)
        assert upd.status_code == 200, upd.text
        assert upd.json()["name"] == "TEST Bilingual Updated"

        # PUBLIC GET shows the new product with name_ka
        pub = api.get(f"{BASE_URL}/api/products/{slug}")
        assert pub.status_code == 200, pub.text
        assert pub.json()["name_ka"] == payload["name_ka"]

        # DELETE
        d = api.delete(f"{BASE_URL}/api/admin/products/{product_id}", headers=auth_headers)
        assert d.status_code in (200, 204)

        # Confirm gone
        gone = api.get(f"{BASE_URL}/api/products/{slug}")
        assert gone.status_code == 404


# ---------- SPECIAL OFFERS CRUD ----------
class TestAdminSpecialOffers:
    def test_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/special-offers")
        assert r.status_code == 401

    def test_full_crud_flow(self, api, auth_headers):
        slug = f"test-offer-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "title": "TEST QA Offer 30% off",
            "title_ka": "ტესტ შეთავაზება",
            "description": "Test offer description",
            "description_ka": "ტესტ აღწერა",
            "image": PEXELS_IMAGE,
            "discount_percent": 30,
            "sub_category": "toys-accessories",
            "status": "published",
        }
        r = api.post(f"{BASE_URL}/api/admin/special-offers", json=payload, headers=auth_headers)
        assert r.status_code == 201, r.text
        offer = r.json()
        oid = offer["id"]
        assert offer["title_ka"] == payload["title_ka"]
        assert offer["discount_percent"] == 30

        # Public list should include it (no dates set -> always in window)
        pub = api.get(f"{BASE_URL}/api/special-offers")
        assert pub.status_code == 200
        assert any(o["id"] == oid for o in pub.json())

        # UPDATE
        upd = api.put(
            f"{BASE_URL}/api/admin/special-offers/{oid}",
            json={**payload, "title": "TEST QA Offer Updated"},
            headers=auth_headers,
        )
        assert upd.status_code == 200, upd.text
        assert upd.json()["title"] == "TEST QA Offer Updated"

        # DELETE
        d = api.delete(f"{BASE_URL}/api/admin/special-offers/{oid}", headers=auth_headers)
        assert d.status_code in (200, 204)

    def test_public_filters_expired_offers(self, api, auth_headers):
        slug = f"test-expired-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "title": "TEST Expired Offer",
            "description": "Old offer",
            "image": PEXELS_IMAGE,
            "starts_at": "2020-01-01T00:00:00+00:00",
            "ends_at": "2020-12-31T23:59:59+00:00",
            "status": "published",
        }
        r = api.post(f"{BASE_URL}/api/admin/special-offers", json=payload, headers=auth_headers)
        assert r.status_code == 201, r.text
        oid = r.json()["id"]
        try:
            pub = api.get(f"{BASE_URL}/api/special-offers")
            assert pub.status_code == 200
            assert not any(o["id"] == oid for o in pub.json()), "Expired offer should be hidden from public endpoint"
        finally:
            api.delete(f"{BASE_URL}/api/admin/special-offers/{oid}", headers=auth_headers)


# ---------- PUBLIC PRODUCTS BILINGUAL ----------
class TestPublicProductsBilingual:
    def test_products_expose_bilingual_fields(self, api):
        r = api.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        first = items[0]
        # Field present (may be null for seeded products) — schema must include the key
        assert "name_ka" in first
        assert "description_ka" in first


# ---------- UPLOADS ----------
class TestAdminUploads:
    def _png_bytes(self) -> bytes:
        # Minimal valid 1x1 PNG
        import base64
        return base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAarVyFEAAAAASUVORK5CYII="
        )

    def test_upload_requires_auth(self):
        files = {"file": ("a.png", self._png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/uploads", files=files)
        assert r.status_code == 401

    def test_upload_image_success(self, admin_token):
        files = {"file": ("test.png", self._png_bytes(), "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/admin/uploads",
            files=files,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].endswith(".png")
        assert "/api/uploads/" in data["url"]
        # Verify the URL is actually serveable
        head = requests.get(data["url"])
        assert head.status_code == 200, f"Uploaded image not served at {data['url']}"

    def test_upload_rejects_non_image(self, admin_token):
        files = {"file": ("malicious.txt", b"hello", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/admin/uploads",
            files=files,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 400, r.text

    def test_upload_rejects_oversize(self, admin_token):
        big = b"\x00" * (6 * 1024 * 1024 + 100)
        files = {"file": ("big.png", big, "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/admin/uploads",
            files=files,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 413, r.text


# ---------- LEADS / CONTACTS (admin viewers) ----------
class TestAdminViewers:
    def test_leads_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/leads")
        assert r.status_code == 401

    def test_contacts_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/contact-inquiries")
        assert r.status_code == 401

    def test_leads_ok(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contacts_ok(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/contact-inquiries", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
