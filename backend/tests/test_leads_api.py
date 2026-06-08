"""
Backend API tests for SmartPaw Food /api/leads endpoints.
Covers: POST validation, persistence, GET ordering.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://smart-feed-pets.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health / root ---
def test_root(api_client):
    r = api_client.get(f"{API}/")
    assert r.status_code == 200
    assert "SmartPaw" in r.json().get("message", "")


# --- POST /api/leads happy path + persistence ---
class TestLeadsCRUD:
    def test_create_lead_success(self, api_client):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_User_{unique}",
            "email": f"test_{unique}@example.com",
            "phone": "+995591000000",
            "pet_type": "dog",
            "pet_name": "Bibo",
            "pet_breed": "Cocker",
            "pet_age": "3 years",
            "notes": "Allergies to chicken",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert "created_at" in data

        # Persistence check via GET
        list_r = api_client.get(f"{API}/leads")
        assert list_r.status_code == 200
        items = list_r.json()
        assert any(it["id"] == data["id"] for it in items), "Lead not persisted in GET list"

    def test_get_leads_sorted_desc(self, api_client):
        u1 = uuid.uuid4().hex[:6]
        u2 = uuid.uuid4().hex[:6]
        p1 = {"name": f"TEST_A_{u1}", "email": f"a_{u1}@ex.com", "phone": "+995591111111", "pet_type": "cat"}
        r1 = api_client.post(f"{API}/leads", json=p1)
        assert r1.status_code == 201
        id1 = r1.json()["id"]

        p2 = {"name": f"TEST_B_{u2}", "email": f"b_{u2}@ex.com", "phone": "+995591222222", "pet_type": "both"}
        r2 = api_client.post(f"{API}/leads", json=p2)
        assert r2.status_code == 201
        id2 = r2.json()["id"]

        lr = api_client.get(f"{API}/leads")
        assert lr.status_code == 200
        items = lr.json()
        ids_in_order = [it["id"] for it in items]
        # id2 created last, should appear before id1
        assert id2 in ids_in_order and id1 in ids_in_order
        assert ids_in_order.index(id2) < ids_in_order.index(id1), "Leads not sorted by created_at desc"

    def test_create_lead_invalid_email(self, api_client):
        payload = {
            "name": "TEST_BadEmail",
            "email": "not-an-email",
            "phone": "+995591000001",
            "pet_type": "dog",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert 400 <= r.status_code < 500, f"Expected 4xx, got {r.status_code}"

    def test_create_lead_missing_required_fields(self, api_client):
        # Missing name + phone
        payload = {"email": "missing@example.com", "pet_type": "dog"}
        r = api_client.post(f"{API}/leads", json=payload)
        assert 400 <= r.status_code < 500

    def test_create_lead_empty_name(self, api_client):
        payload = {"name": "", "email": "x@y.com", "phone": "+995591", "pet_type": "dog"}
        r = api_client.post(f"{API}/leads", json=payload)
        assert 400 <= r.status_code < 500

    def test_create_lead_minimal_required(self, api_client):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_Min_{unique}",
            "email": f"min_{unique}@example.com",
            "phone": "+9955910",
            "pet_type": "cat",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["name"] == payload["name"]
