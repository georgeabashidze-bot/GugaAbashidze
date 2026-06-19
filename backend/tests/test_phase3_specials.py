"""Phase 3 backend tests: specials products + promos endpoint + regression."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # Fallback to frontend .env
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
                break

API = f"{BASE_URL}/api"


# ---- Products: catalogue + specials totals ----
class TestProductsTotals:
    def test_all_products_total_36(self):
        r = requests.get(f"{API}/products", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 36, f"Expected 36, got {len(items)}"

    def test_six_per_sub_category(self):
        r = requests.get(f"{API}/products", timeout=20)
        items = r.json()
        from collections import Counter
        counts = Counter(p['sub_category'] for p in items)
        expected = ['food', 'hygiene', 'vitamins', 'toys-accessories', 'innovation-tech', 'services']
        for sub in expected:
            assert counts.get(sub) == 6, f"sub_category {sub} count={counts.get(sub)}, expected 6"

    def test_specials_total_18(self):
        r = requests.get(f"{API}/products", params={"category": "specials"}, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 18
        for p in items:
            assert p['category'] == 'specials'

    @pytest.mark.parametrize("sub", ["toys-accessories", "innovation-tech", "services"])
    def test_specials_sub_category_each_6(self, sub):
        r = requests.get(f"{API}/products", params={"category": "specials", "sub_category": sub}, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 6
        for p in items:
            assert p['category'] == 'specials'
            assert p['sub_category'] == sub


# ---- Single product lookup ----
class TestProductDetail:
    @pytest.mark.parametrize("slug", [
        "smartpaw-smart-feeder-pro",
        "kong-classic-rubber-toy",
        "mobile-grooming-session",
    ])
    def test_get_special_product(self, slug):
        r = requests.get(f"{API}/products/{slug}", timeout=20)
        assert r.status_code == 200, f"slug={slug} -> {r.status_code} body={r.text[:200]}"
        d = r.json()
        assert d['slug'] == slug
        assert d['category'] == 'specials'


# ---- Promos endpoint ----
class TestPromos:
    def test_promos_returns_three_active(self):
        r = requests.get(f"{API}/promos", timeout=20)
        assert r.status_code == 200, r.text[:300]
        promos = r.json()
        assert len(promos) == 3, f"Expected 3 promos, got {len(promos)}"
        slugs = {p['slug'] for p in promos}
        assert slugs == {"free-feeder-annual", "winter-toys-bundle", "first-groom-half"}

    def test_promo_fields_complete(self):
        r = requests.get(f"{API}/promos", timeout=20)
        promos = r.json()
        required = ["title", "subtitle", "badge", "cta_label", "cta_route",
                    "image", "accent", "starts_at", "ends_at", "active", "order"]
        for p in promos:
            for k in required:
                assert k in p and p[k] not in (None, ""), f"promo {p.get('slug')} missing {k}"
            assert p['active'] is True

    def test_promo_cta_routes(self):
        r = requests.get(f"{API}/promos", timeout=20)
        promos = {p['slug']: p for p in r.json()}
        assert promos['free-feeder-annual']['cta_route'] == '/special-offers/innovation-tech'
        assert promos['winter-toys-bundle']['cta_route'] == '/special-offers/toys-accessories'
        assert promos['first-groom-half']['cta_route'] == '/special-offers/services'

    def test_promos_sorted_by_order(self):
        r = requests.get(f"{API}/promos", timeout=20)
        promos = r.json()
        orders = [p['order'] for p in promos]
        assert orders == sorted(orders), f"Promos not sorted by order: {orders}"


# ---- Phase 2 regression ----
class TestRegression:
    def test_catalogue_food_six(self):
        r = requests.get(f"{API}/products", params={"sub_category": "food"}, timeout=20)
        assert r.status_code == 200
        assert len(r.json()) == 6

    def test_pet_type_cat_filter(self):
        r = requests.get(f"{API}/products", params={"pet_type": "cat"}, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert p['pet_type'] in ('cat', 'both')

    def test_leads_post_get(self):
        payload = {
            "name": "TEST_Phase3",
            "email": "test_phase3@example.com",
            "phone": "+995555000111",
            "pet_type": "dog",
        }
        r = requests.post(f"{API}/leads", json=payload, timeout=20)
        assert r.status_code == 201, r.text[:200]
        body = r.json()
        assert body['email'] == payload['email']
        # verify list
        r2 = requests.get(f"{API}/leads", timeout=20)
        assert r2.status_code == 200
        assert any(le['id'] == body['id'] for le in r2.json())
