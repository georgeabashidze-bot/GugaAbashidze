"""Phase 6 backend tests: blog endpoints + regression of existing APIs."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to frontend/.env (testing env)
    from pathlib import Path
    for ln in Path("/app/frontend/.env").read_text().splitlines():
        if ln.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = ln.split("=", 1)[1].strip().rstrip("/")
            break

KNOWN_SLUGS = [
    "why-routine-feeding-matters",
    "switching-foods-without-fuss",
    "indoor-cat-checklist",
]


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---- Blog list ----
class TestBlogList:
    def test_list_blog_posts_returns_3(self, s):
        r = s.get(f"{BASE_URL}/api/blog/posts", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3
        slugs = [p["slug"] for p in data]
        for slug in KNOWN_SLUGS:
            assert slug in slugs, f"Missing slug {slug}"

    def test_list_blog_posts_fields(self, s):
        data = s.get(f"{BASE_URL}/api/blog/posts", timeout=20).json()
        required = ["slug", "title", "excerpt", "cover_image",
                    "author_name", "read_minutes", "published_at", "tags"]
        for p in data:
            for k in required:
                assert k in p, f"{p.get('slug')} missing {k}"
            assert isinstance(p["read_minutes"], int)
            assert isinstance(p["tags"], list)
            assert isinstance(p["published_at"], str)

    def test_list_posts_sorted_desc(self, s):
        data = s.get(f"{BASE_URL}/api/blog/posts", timeout=20).json()
        pubs = [p["published_at"] for p in data]
        assert pubs == sorted(pubs, reverse=True)

    def test_filter_by_feeding_tag(self, s):
        r = s.get(f"{BASE_URL}/api/blog/posts", params={"tag": "feeding"}, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["slug"] == "why-routine-feeding-matters"


# ---- Blog single ----
class TestBlogSingle:
    @pytest.mark.parametrize("slug", KNOWN_SLUGS)
    def test_get_blog_post(self, s, slug):
        r = s.get(f"{BASE_URL}/api/blog/posts/{slug}", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == slug
        assert data.get("content"), "content must be non-empty"
        assert len(data["content"]) > 50

    def test_get_blog_post_404(self, s):
        r = s.get(f"{BASE_URL}/api/blog/posts/does-not-exist", timeout=20)
        assert r.status_code == 404


# ---- Regression ----
class TestRegression:
    def test_create_lead_valid(self, s):
        r = s.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_BlogPhase6", "email": "test_phase6@example.com",
            "phone": "+995555000111", "pet_type": "dog"
        }, timeout=20)
        assert r.status_code == 201
        assert r.json()["email"] == "test_phase6@example.com"

    def test_create_lead_invalid_email(self, s):
        r = s.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_Bad", "email": "not-an-email",
            "phone": "+995555000111", "pet_type": "dog"
        }, timeout=20)
        assert r.status_code == 422

    def test_products_count(self, s):
        r = s.get(f"{BASE_URL}/api/products", timeout=20)
        assert r.status_code == 200
        assert len(r.json()) >= 18

    def test_promos(self, s):
        r = s.get(f"{BASE_URL}/api/promos", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contact_inquiry_valid(self, s):
        r = s.post(f"{BASE_URL}/api/contact-inquiries", json={
            "name": "TEST_Phase6", "email": "test_phase6_ci@example.com",
            "subject": "test", "message": "hello"
        }, timeout=20)
        assert r.status_code == 201

    def test_contact_inquiry_missing_email(self, s):
        r = s.post(f"{BASE_URL}/api/contact-inquiries", json={
            "name": "TEST_Phase6", "subject": "x", "message": "y"
        }, timeout=20)
        assert r.status_code == 422
