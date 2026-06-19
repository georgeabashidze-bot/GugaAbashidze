"""Backend tests — Phase 2 catalogue products API + Phase 1 leads regression."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://smart-feed-pets.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Products: list endpoint ----------
class TestProductsList:
    def test_list_all_products(self, client):
        r = client.get(f"{BASE_URL}/api/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 18, f"Expected >=18 products, got {len(data)}"
        required = {"id", "slug", "name", "brand", "category", "sub_category",
                    "pet_type", "image", "description", "status"}
        for p in data:
            missing = required - set(p.keys())
            assert not missing, f"Missing fields {missing} in {p.get('slug')}"
            assert p["status"] == "published"

    def test_filter_food(self, client):
        r = client.get(f"{BASE_URL}/api/products?sub_category=food", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6, f"food returned {len(data)} products"
        for p in data:
            assert p["sub_category"] == "food"
            assert p["category"] == "catalogue"

    def test_filter_hygiene(self, client):
        r = client.get(f"{BASE_URL}/api/products?sub_category=hygiene", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        for p in data:
            assert p["sub_category"] == "hygiene"

    def test_filter_vitamins(self, client):
        r = client.get(f"{BASE_URL}/api/products?sub_category=vitamins", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        for p in data:
            assert p["sub_category"] == "vitamins"

    def test_filter_pet_type_cat(self, client):
        r = client.get(f"{BASE_URL}/api/products?pet_type=cat", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for p in data:
            assert p["pet_type"] in ("cat", "both"), f"{p['slug']} pet_type={p['pet_type']}"

    def test_filter_featured(self, client):
        r = client.get(f"{BASE_URL}/api/products?featured=true", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        for p in data:
            assert p["featured"] is True


# ---------- Products: detail endpoint ----------
class TestProductDetail:
    def test_get_existing(self, client):
        r = client.get(f"{BASE_URL}/api/products/royal-canin-medium-adult", timeout=30)
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "royal-canin-medium-adult"
        assert p["brand"] == "Royal Canin"
        assert p["sub_category"] == "food"

    def test_get_other_slugs(self, client):
        for slug in [
            "hills-science-plan-adult-cat",
            "tropiclean-deep-cleansing-shampoo",
            "vetriscience-composure-chews",
        ]:
            r = client.get(f"{BASE_URL}/api/products/{slug}", timeout=30)
            assert r.status_code == 200, f"{slug} -> {r.status_code}"
            assert r.json()["slug"] == slug

    def test_get_not_found(self, client):
        r = client.get(f"{BASE_URL}/api/products/does-not-exist", timeout=30)
        assert r.status_code == 404


# ---------- Leads regression (Phase 1) ----------
class TestLeadsRegression:
    def test_create_and_list_lead(self, client):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_Phase2 {unique}",
            "email": f"test_phase2_{unique}@example.com",
            "phone": "+995555000111",
            "pet_type": "dog",
            "pet_name": "Buddy",
            "notes": "Phase2 regression",
        }
        r = client.post(f"{BASE_URL}/api/leads", json=payload, timeout=30)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["email"] == payload["email"]
        assert "id" in body

        lst = client.get(f"{BASE_URL}/api/leads", timeout=30)
        assert lst.status_code == 200
        emails = [x["email"] for x in lst.json()]
        assert payload["email"] in emails
