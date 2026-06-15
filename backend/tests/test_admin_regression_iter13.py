"""Admin full regression — iteration 13.

Covers the review-request scope after the Bewital catalogue import
(166 drafts) + the new POST /api/admin/products/import/bewital endpoint.

Run:
  pytest /app/backend/tests/test_admin_regression_iter13.py -v \
    --junitxml=/app/test_reports/pytest/iter13.xml
"""
from __future__ import annotations

import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://smart-feed-pets.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@smartpawfood.com"
ADMIN_PASSWORD = "ChangeMe123!"

# Tiny 1x1 transparent PNG for upload tests
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f"
    b"\x00\x00\x01\x01\x00\x05\x9b\x9e\xc6\xb6\x00\x00\x00\x00IEND\xaeB`\x82"
)


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------
@pytest.fixture(scope="session")
def admin_token() -> str:
    r = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    if r.status_code != 200:
        pytest.skip(f"Cannot authenticate admin: {r.status_code} {r.text[:200]}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# -----------------------------------------------------------------------------
# AUTH
# -----------------------------------------------------------------------------
class TestAuth:
    def test_login_success(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and len(data["access_token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"

    def test_me_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/me", timeout=15)
        assert r.status_code in (401, 403)

    def test_me_with_auth(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json().get("email") == ADMIN_EMAIL


# -----------------------------------------------------------------------------
# PRODUCTS (incl. Bewital drafts verification)
# -----------------------------------------------------------------------------
class TestProducts:
    def test_list_products(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) > 0
        # mongo ObjectId must not leak
        assert "_id" not in items[0]

    def test_bewital_drafts_present(self, auth_headers):
        # The "Bewital partner catalogue" actually contains multiple brands
        # (Belcando, Leonardo, Bewi Dog, 4 Dogs, R-Line, Bewi Cat, …) — so we
        # assert on the total draft count which should be ~166 imports.
        r = requests.get(
            f"{BASE_URL}/api/admin/products", headers=auth_headers, timeout=30
        )
        assert r.status_code == 200
        items = r.json()
        drafts = [p for p in items if p.get("status") == "draft"]
        assert len(drafts) >= 150, f"Expected >=150 drafts, got {len(drafts)}"
        # Spot-check that drafts carry bilingual EN+KA fields
        bilingual = [p for p in drafts if p.get("name_ka") and p.get("description_ka")]
        assert len(bilingual) >= 150, (
            f"Expected >=150 drafts with name_ka+description_ka, got {len(bilingual)}"
        )
        # Ensure at least one Bewi Dog / Bewi Cat row from the pricelist made it
        bewi = [p for p in drafts if (p.get("brand") or "").lower().startswith("bewi")]
        assert len(bewi) >= 1, "No Bewi Dog/Cat drafts found"

    def test_product_detail_round_trip_update(self, auth_headers):
        # Find a Bewital draft to round-trip
        r = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers=auth_headers,
            params={"q": "Bewital"},
            timeout=20,
        )
        items = [p for p in r.json() if p.get("status") == "draft"]
        if not items:
            pytest.skip("no Bewital drafts available")
        target = items[0]
        pid = target["id"]
        orig_price = target.get("price") or 0

        # PUT with updated price/name (preserve required fields)
        payload = {
            "slug": target["slug"],
            "name": target["name"] + " (regression)",
            "name_ka": target.get("name_ka") or target["name"],
            "brand": target["brand"],
            "category": target["category"],
            "sub_category": target["sub_category"],
            "product_type": target.get("product_type"),
            "pet_type": target.get("pet_type", "both"),
            "image": target["image"],
            "description": target["description"],
            "description_ka": target.get("description_ka") or target["description"],
            "size": target.get("size"),
            "price": 42.5,
            "currency": target.get("currency", "GEL"),
            "tags": target.get("tags", []),
            "featured": target.get("featured", False),
            "status": "draft",
        }
        ur = requests.put(
            f"{BASE_URL}/api/admin/products/{pid}",
            headers=auth_headers,
            json=payload,
            timeout=20,
        )
        assert ur.status_code == 200, ur.text
        assert ur.json()["price"] == 42.5
        assert ur.json()["name"].endswith("(regression)")

        # Revert
        payload["name"] = target["name"]
        payload["price"] = orig_price
        revert = requests.put(
            f"{BASE_URL}/api/admin/products/{pid}",
            headers=auth_headers,
            json=payload,
            timeout=20,
        )
        assert revert.status_code == 200

    def test_create_and_delete_product(self, auth_headers):
        slug = f"test-regression-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "name": "TEST_Regression Product",
            "name_ka": "ტესტი პროდუქტი",
            "brand": "TestBrand",
            "category": "catalogue",
            "sub_category": "food",
            "product_type": "dry-food",
            "pet_type": "dog",
            "image": "https://placehold.co/600",
            "description": "EN description",
            "description_ka": "KA აღწერა",
            "size": "1kg",
            "price": 10.5,
            "currency": "GEL",
            "tags": ["test"],
            "featured": False,
            "status": "draft",
        }
        cr = requests.post(
            f"{BASE_URL}/api/admin/products",
            headers=auth_headers,
            json=payload,
            timeout=20,
        )
        assert cr.status_code == 201, cr.text
        pid = cr.json()["id"]
        # verify via GET list (no single GET endpoint)
        lr = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers=auth_headers,
            params={"q": "TEST_Regression"},
            timeout=20,
        )
        assert any(p["id"] == pid for p in lr.json())
        # delete
        dr = requests.delete(
            f"{BASE_URL}/api/admin/products/{pid}",
            headers=auth_headers,
            timeout=20,
        )
        assert dr.status_code == 204

    def test_upload_image(self, auth_headers):
        files = {"file": ("test.png", PNG_BYTES, "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/admin/uploads",
            headers=auth_headers,
            files=files,
            timeout=30,
        )
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("http")
        assert "/api/uploads/" in url


# -----------------------------------------------------------------------------
# SPECIAL OFFERS CRUD
# -----------------------------------------------------------------------------
class TestSpecialOffers:
    def test_full_crud(self, auth_headers):
        slug = f"test-offer-{uuid.uuid4().hex[:8]}"
        payload = {
            "slug": slug,
            "title": "TEST_Regression Offer",
            "title_ka": "ტესტი შეთავაზება",
            "description": "EN desc",
            "description_ka": "KA აღწერა",
            "image": "https://placehold.co/600",
            "badge": "TEST",
            "discount_percent": 15,
            "sub_category": "toys-accessories",
            "status": "draft",
        }
        cr = requests.post(
            f"{BASE_URL}/api/admin/special-offers",
            headers=auth_headers,
            json=payload,
            timeout=20,
        )
        assert cr.status_code == 201, cr.text
        oid = cr.json()["id"]

        lr = requests.get(
            f"{BASE_URL}/api/admin/special-offers", headers=auth_headers, timeout=20
        )
        assert lr.status_code == 200
        assert any(o["id"] == oid for o in lr.json())

        payload["title"] = "TEST_Regression Offer EDITED"
        ur = requests.put(
            f"{BASE_URL}/api/admin/special-offers/{oid}",
            headers=auth_headers,
            json=payload,
            timeout=20,
        )
        assert ur.status_code == 200
        assert ur.json()["title"].endswith("EDITED")

        dr = requests.delete(
            f"{BASE_URL}/api/admin/special-offers/{oid}",
            headers=auth_headers,
            timeout=20,
        )
        assert dr.status_code == 204


# -----------------------------------------------------------------------------
# PLANS / BLOG CRUD
# -----------------------------------------------------------------------------
class TestPlans:
    def test_plans_list(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/plans", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_plan_crud(self, auth_headers):
        slug = f"test-plan-{uuid.uuid4().hex[:6]}"
        payload = {
            "slug": slug,
            "name": "TEST_Regression Plan",
            "tagline": "EN tagline",
            "price": "0",
            "features": [{"en": "feature 1", "ka": "ფიჩერი 1"}],
            "status": "draft",
        }
        cr = requests.post(f"{BASE_URL}/api/admin/plans", headers=auth_headers, json=payload, timeout=20)
        assert cr.status_code == 201, cr.text
        pid = cr.json()["id"]
        dr = requests.delete(f"{BASE_URL}/api/admin/plans/{pid}", headers=auth_headers, timeout=20)
        assert dr.status_code == 204


class TestBlog:
    def test_blog_list(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/blog-posts", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_blog_crud(self, auth_headers):
        slug = f"test-post-{uuid.uuid4().hex[:6]}"
        payload = {
            "slug": slug,
            "title": "TEST_Regression Post",
            "excerpt": "EN excerpt",
            "content": "# hi\n\ncontent body",
            "status": "draft",
        }
        cr = requests.post(f"{BASE_URL}/api/admin/blog-posts", headers=auth_headers, json=payload, timeout=20)
        assert cr.status_code == 201, cr.text
        pid = cr.json()["id"]
        dr = requests.delete(f"{BASE_URL}/api/admin/blog-posts/{pid}", headers=auth_headers, timeout=20)
        assert dr.status_code == 204


# -----------------------------------------------------------------------------
# LEADS / CONTACT INQUIRIES
# -----------------------------------------------------------------------------
class TestLeadsAndContacts:
    def test_leads_list(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contact_inquiries_list(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/contact-inquiries", headers=auth_headers, timeout=20
        )
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# -----------------------------------------------------------------------------
# BEWITAL ONE-CLICK IMPORT (dry-run only)
# -----------------------------------------------------------------------------
class TestBewitalImport:
    def test_dry_run(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/products/import/bewital",
            headers=auth_headers,
            params={"dry_run": "true", "limit": 2},
            timeout=120,
        )
        # Even if LLM is degraded, route must respond with structured payload
        # not 5xx; allow 200 or 400 (price file missing) but not 500.
        assert r.status_code in (200, 400), f"{r.status_code} {r.text[:300]}"
        if r.status_code == 200:
            data = r.json()
            assert data.get("dry_run") is True
            assert data.get("total_parsed", 0) > 0


# -----------------------------------------------------------------------------
# PUBLIC ENDPOINTS — drafts must NOT leak
# -----------------------------------------------------------------------------
class TestPublic:
    def test_public_products_excludes_drafts(self):
        r = requests.get(f"{BASE_URL}/api/products", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        # No draft must appear publicly
        for p in items:
            assert p.get("status", "published") != "draft", f"draft leaked: {p.get('slug')}"
        # And no bewital-imported slug (they are still drafts)
        bewital = [p for p in items if "bewital" in (p.get("slug") or "").lower()
                   or (p.get("brand") or "").lower().startswith("bewi")]
        # If main agent publishes some, allow up to a few — but the bulk 160 must remain hidden
        assert len(bewital) < 50, f"too many Bewital products leaked publicly: {len(bewital)}"

    def test_public_special_offers(self):
        r = requests.get(f"{BASE_URL}/api/special-offers", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_public_blog_posts(self):
        r = requests.get(f"{BASE_URL}/api/blog/posts", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_public_promos(self):
        r = requests.get(f"{BASE_URL}/api/promos", timeout=20)
        assert r.status_code == 200


# -----------------------------------------------------------------------------
# BRUTE FORCE LOCKOUT
# -----------------------------------------------------------------------------
class TestBruteForce:
    def test_lockout_after_5_fails(self):
        # Use a unique email to avoid IP-pollution for the legit admin
        bad_email = f"lockout-{uuid.uuid4().hex[:6]}@smartpawfood.com"
        seen_429 = False
        last_status = None
        for i in range(7):
            r = requests.post(
                f"{BASE_URL}/api/admin/login",
                json={"email": bad_email, "password": "wrong-pass"},
                timeout=15,
            )
            last_status = r.status_code
            if r.status_code == 429:
                seen_429 = True
                break
            time.sleep(0.2)
        assert seen_429, f"Did not receive 429 after 7 failed attempts (last={last_status})"
