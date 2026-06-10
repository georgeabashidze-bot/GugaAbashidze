"""Backend tests for Phase 5 contact-inquiries endpoints + regression for leads/products/promos."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://smart-feed-pets.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestContactInquiries:
    def test_create_valid(self, api):
        payload = {
            "name": "TEST_Pytest User",
            "email": "TEST_pytest@example.com",
            "subject": "Hello from pytest",
            "message": "This is a pytest message body.",
            "department": "general",
        }
        r = api.post(f"{BASE_URL}/api/contact-inquiries", json=payload, timeout=20)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["subject"] == payload["subject"]
        assert "created_at" in data
        # persistence: GET list contains the new id
        listing = api.get(f"{BASE_URL}/api/contact-inquiries", timeout=20)
        assert listing.status_code == 200
        ids = [item["id"] for item in listing.json()]
        assert data["id"] in ids

    def test_create_missing_email_returns_422(self, api):
        payload = {
            "name": "TEST_NoEmail",
            "subject": "Missing email",
            "message": "should fail validation",
        }
        r = api.post(f"{BASE_URL}/api/contact-inquiries", json=payload, timeout=20)
        assert r.status_code == 422, r.text

    def test_create_invalid_email_returns_422(self, api):
        payload = {
            "name": "TEST_BadEmail",
            "email": "not-an-email",
            "subject": "Bad email",
            "message": "should fail validation",
        }
        r = api.post(f"{BASE_URL}/api/contact-inquiries", json=payload, timeout=20)
        assert r.status_code == 422


class TestRegression:
    def test_leads_post_and_get(self, api):
        payload = {
            "name": "TEST_LeadUser",
            "email": "TEST_lead@example.com",
            "phone": "+995555111222",
            "pet_type": "dog",
            "pet_name": "Rex",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload, timeout=20)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["email"] == payload["email"]
        lst = api.get(f"{BASE_URL}/api/leads", timeout=20)
        assert lst.status_code == 200
        assert any(it["id"] == data["id"] for it in lst.json())

    def test_products_list(self, api):
        r = api.get(f"{BASE_URL}/api/products", timeout=20)
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        assert len(body) > 0
        # spot-check fields
        p = body[0]
        for f in ("id", "slug", "name", "brand", "category", "sub_category"):
            assert f in p

    def test_promos_list(self, api):
        r = api.get(f"{BASE_URL}/api/promos", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
