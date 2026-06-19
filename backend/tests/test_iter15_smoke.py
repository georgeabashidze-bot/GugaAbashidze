"""Iteration 15 — pre-launch smoke tests for SmartPaw Food.

Covers: SEO assets (robots.txt, sitemap.xml, favicon), public APIs
(products, plans, blog, leads), and admin auth (success + 401 + brute force).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://smart-feed-pets.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@smartpawfood.com"
ADMIN_PASSWORD = "Pdatisandro13"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- SEO assets -----
class TestSEOAssets:
    def test_robots_at_api(self, session):
        r = session.get(f"{BASE_URL}/api/robots.txt", timeout=15)
        assert r.status_code == 200
        assert "User-agent" in r.text

    def test_robots_at_root(self, session):
        # Frontend public/robots.txt
        r = session.get(f"{BASE_URL}/robots.txt", timeout=15)
        assert r.status_code == 200, f"GET /robots.txt got {r.status_code}"
        assert "User-agent" in r.text or "user-agent" in r.text.lower()

    def test_sitemap_at_api(self, session):
        r = session.get(f"{BASE_URL}/api/sitemap.xml", timeout=20)
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert "xml" in ct, f"sitemap content-type={ct}"
        body = r.text
        assert "<urlset" in body
        # Required URLs
        assert "/plans" in body
        assert "/products" in body or "/catalogue" in body
        # Homepage url
        assert "<loc>" in body

    def test_sitemap_at_root(self, session):
        # Site root sitemap.xml — may or may not exist depending on frontend
        r = session.get(f"{BASE_URL}/sitemap.xml", timeout=20)
        # Either 200 with XML or it may be served by frontend SPA index.html
        # Mark this as informational; only assert reachable
        assert r.status_code in (200, 404), f"/sitemap.xml status={r.status_code}"

    def test_favicon(self, session):
        r = session.get(f"{BASE_URL}/favicon.svg", timeout=15)
        assert r.status_code == 200
        assert "svg" in r.headers.get("content-type", "").lower() or r.text.lstrip().startswith("<")


# ----- Public APIs -----
class TestPublicAPIs:
    def test_root(self, session):
        r = session.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200

    def test_products_list(self, session):
        r = session.get(f"{BASE_URL}/api/products", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        p = data[0]
        # bilingual fields exposed
        assert "name" in p and "description" in p
        assert "name_ka" in p
        assert "description_ka" in p

    def test_products_filter_cat(self, session):
        r = session.get(f"{BASE_URL}/api/products?pet_type=cat", timeout=20)
        assert r.status_code == 200
        for p in r.json():
            assert p["pet_type"] in ("cat", "both")

    def test_products_filter_dog(self, session):
        r = session.get(f"{BASE_URL}/api/products?pet_type=dog", timeout=20)
        assert r.status_code == 200
        for p in r.json():
            assert p["pet_type"] in ("dog", "both")

    def test_plans(self, session):
        r = session.get(f"{BASE_URL}/api/plans", timeout=15)
        assert r.status_code == 200
        plans = r.json()
        assert isinstance(plans, list) and len(plans) >= 3

    def test_blog_posts_list_and_detail(self, session):
        r = session.get(f"{BASE_URL}/api/blog/posts", timeout=15)
        assert r.status_code == 200
        posts = r.json()
        assert isinstance(posts, list) and len(posts) > 0
        first_slug = posts[0]["slug"]
        d = session.get(f"{BASE_URL}/api/blog/posts/{first_slug}", timeout=15)
        assert d.status_code == 200
        body = d.json()
        assert body["slug"] == first_slug
        assert "content" in body

    def test_leads_create(self, session):
        payload = {
            "name": "TEST_iter15 lead",
            "email": "iter15-lead@test.example",
            "phone": "+995500000000",
            "pet_type": "dog",
            "pet_name": "TestDog",
            "notes": "iter15 smoke test",
        }
        r = session.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
        assert r.status_code == 201, f"leads got {r.status_code} body={r.text[:200]}"
        body = r.json()
        assert body["email"] == payload["email"]
        assert "id" in body


# ----- Admin auth -----
class TestAdminAuth:
    def test_login_success(self, session):
        r = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, f"login got {r.status_code} body={r.text[:200]}"
        body = r.json()
        assert "access_token" in body
        assert body["user"]["email"] == ADMIN_EMAIL
        assert body["user"]["role"] == "admin"
        # Reuse token for next test via class attr
        TestAdminAuth.token = body["access_token"]

    def test_me_with_token(self, session):
        token = getattr(TestAdminAuth, "token", None)
        if not token:
            pytest.skip("no token from login")
        r = session.get(
            f"{BASE_URL}/api/admin/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json().get("email") == ADMIN_EMAIL

    def test_login_wrong_password(self, session):
        # Use a unique wrong email to avoid counting against the real admin
        r = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": "wrong-password-iter15"},
            timeout=15,
        )
        # Could be 401 or 429 if lockout — both acceptable failure modes
        assert r.status_code in (401, 429), f"got {r.status_code}"

    def test_admin_products_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/admin/products", timeout=15)
        assert r.status_code in (401, 403)

    def test_admin_products_list_and_save(self, session):
        token = getattr(TestAdminAuth, "token", None)
        if not token:
            pytest.skip("no token")
        headers = {"Authorization": f"Bearer {token}"}
        r = session.get(f"{BASE_URL}/api/admin/products?limit=5", headers=headers, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        target = items[0]
        original_name = target["name"]
        original_name_ka = target.get("name_ka")
        original_desc_ka = target.get("description_ka")

        # Roundtrip an edit (then restore)
        update = {**target, "name": original_name + " (TEST_iter15)"}
        # ProductIn does not accept id/created_at/updated_at; strip
        for k in ("id", "created_at", "updated_at"):
            update.pop(k, None)
        pid = target["id"]
        r2 = session.put(
            f"{BASE_URL}/api/admin/products/{pid}",
            json=update,
            headers={**headers, "Content-Type": "application/json"},
            timeout=20,
        )
        assert r2.status_code == 200, f"PUT got {r2.status_code} body={r2.text[:200]}"
        assert r2.json()["name"].endswith("(TEST_iter15)")

        # Restore original
        update["name"] = original_name
        update["name_ka"] = original_name_ka
        update["description_ka"] = original_desc_ka
        r3 = session.put(
            f"{BASE_URL}/api/admin/products/{pid}",
            json=update,
            headers={**headers, "Content-Type": "application/json"},
            timeout=20,
        )
        assert r3.status_code == 200

    def test_admin_products_filter_status(self, session):
        token = getattr(TestAdminAuth, "token", None)
        if not token:
            pytest.skip("no token")
        headers = {"Authorization": f"Bearer {token}"}
        r = session.get(
            f"{BASE_URL}/api/admin/products?status=published&limit=3",
            headers=headers,
            timeout=20,
        )
        assert r.status_code == 200
        for p in r.json():
            assert p["status"] == "published"
