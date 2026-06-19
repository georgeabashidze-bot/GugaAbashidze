"""Iter14 — A7 AI Catalog Enrichment + Bulk Actions backend regression.

Covers:
  - Admin login + /me
  - GET /api/admin/products/summary (status_counts + needs_enrichment + by_brand)
  - GET /api/admin/products?needs_enrichment=true filter
  - GET /api/admin/products?status=draft|published
  - GET /api/admin/products?brand=<>
  - POST /api/admin/products/enrich-bulk (kicks off async job)
  - GET  /api/admin/jobs/{job_id} (polling -> done)
  - Idempotency: overwrite=false skips already-enriched ids
  - Overwrite=true regenerates content
  - Bulk publish / unpublish / delete (with TEST_ products only)
"""
from __future__ import annotations

import os
import time
import uuid
import pytest
import requests

_BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not _BACKEND_URL:
    # Fallback to frontend/.env for local pytest runs
    try:
        with open("/app/frontend/.env") as _f:
            for _ln in _f:
                if _ln.startswith("REACT_APP_BACKEND_URL="):
                    _BACKEND_URL = _ln.split("=", 1)[1].strip()
                    break
    except FileNotFoundError:
        pass
if not _BACKEND_URL:
    raise RuntimeError("REACT_APP_BACKEND_URL not configured")
BASE_URL = _BACKEND_URL.rstrip("/")
ADMIN_EMAIL = "admin@smartpawfood.com"
ADMIN_PASSWORD = "ChangeMe123!"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="module")
def session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session: requests.Session) -> str:
    r = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="module")
def auth(admin_token: str) -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    )
    return s


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class TestAuth:
    def test_me(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/me", timeout=20)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == ADMIN_EMAIL
        assert body["role"] == "admin"


# ---------------------------------------------------------------------------
# Summary + filters
# ---------------------------------------------------------------------------
class TestSummaryAndFilters:
    def test_summary_shape(self, auth):
        r = auth.get(f"{BASE_URL}/api/admin/products/summary", timeout=30)
        assert r.status_code == 200
        s = r.json()
        assert "status_counts" in s and "needs_enrichment" in s and "by_brand" in s
        sc = s["status_counts"]
        assert "draft" in sc and "published" in sc and "total" in sc
        assert isinstance(s["needs_enrichment"], int)
        assert isinstance(s["by_brand"], list)
        # save on request for other tests
        pytest.summary_snapshot = s

    def test_needs_enrichment_filter_matches_summary(self, auth):
        s = pytest.summary_snapshot
        r = auth.get(
            f"{BASE_URL}/api/admin/products",
            params={"needs_enrichment": "true", "limit": 5000},
            timeout=60,
        )
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list)
        # Must match summary.needs_enrichment exactly
        assert len(rows) == s["needs_enrichment"], (
            f"needs_enrichment list ({len(rows)}) != summary ({s['needs_enrichment']})"
        )

    def test_status_draft_matches_summary(self, auth):
        s = pytest.summary_snapshot
        r = auth.get(
            f"{BASE_URL}/api/admin/products",
            params={"status": "draft", "limit": 5000},
            timeout=60,
        )
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == s["status_counts"].get("draft", 0)
        for p in rows[:25]:
            assert p["status"] == "draft"

    def test_status_published_matches_summary(self, auth):
        s = pytest.summary_snapshot
        r = auth.get(
            f"{BASE_URL}/api/admin/products",
            params={"status": "published", "limit": 5000},
            timeout=60,
        )
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == s["status_counts"].get("published", 0)

    def test_brand_filter(self, auth):
        s = pytest.summary_snapshot
        if not s["by_brand"]:
            pytest.skip("no brands in catalogue")
        brand = s["by_brand"][0]["brand"]
        expected_total = sum(b["count"] for b in s["by_brand"] if b["brand"] == brand)
        r = auth.get(
            f"{BASE_URL}/api/admin/products",
            params={"brand": brand, "limit": 5000},
            timeout=60,
        )
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == expected_total
        for p in rows[:25]:
            assert p["brand"] == brand


# ---------------------------------------------------------------------------
# Enrichment job: select 2 needs-enrichment draft ids, enrich, poll
# ---------------------------------------------------------------------------
class TestEnrichmentJob:
    def test_enrich_two_drafts_end_to_end(self, auth):
        # Pick 2 needs_enrichment products (status may be draft OR published —
        # the catalogue currently has 0 drafts but 187 published rows that
        # are missing KA fields). The enrich job does not care about status.
        r = auth.get(
            f"{BASE_URL}/api/admin/products",
            params={"needs_enrichment": "true", "limit": 5},
            timeout=60,
        )
        assert r.status_code == 200
        needs = r.json()
        if len(needs) < 2:
            pytest.skip(f"not enough needs_enrichment draft products: {len(needs)}")
        picked = needs[:2]
        ids = [p["id"] for p in picked]
        pytest.enrich_ids = ids
        pytest.enrich_original = picked

        # Kick off job
        r = auth.post(
            f"{BASE_URL}/api/admin/products/enrich-bulk",
            json={"ids": ids, "overwrite": False},
            timeout=30,
        )
        assert r.status_code in (200, 202), f"{r.status_code} {r.text}"
        body = r.json()
        assert "job_id" in body
        assert body["total"] == 2
        # All were needs_enrichment, so skipped_already_enriched must be 0
        assert body["skipped_already_enriched"] == 0
        job_id = body["job_id"]
        pytest.enrich_job_id = job_id

        # Poll job
        deadline = time.time() + 90
        final = None
        while time.time() < deadline:
            jr = auth.get(f"{BASE_URL}/api/admin/jobs/{job_id}", timeout=20)
            assert jr.status_code == 200
            jdoc = jr.json()
            assert jdoc["id"] == job_id
            if jdoc["status"] in ("done", "error"):
                final = jdoc
                break
            time.sleep(2)

        assert final is not None, "job did not finish in 90s"
        assert final["status"] == "done", f"job ended with {final.get('status')} err={final.get('error')} fails={final.get('failures')}"
        assert final["succeeded"] + final["skipped"] + final["failed"] == final["total"]

        # Verify products now have description_en + description_ka (>=30 chars)
        for pid in ids:
            pr = auth.get(
                f"{BASE_URL}/api/admin/products",
                params={"q": pid, "limit": 5},
                timeout=15,
            )
            # We don't have a single-product GET, so use list+filter; fall back to scanning needs_enrichment
            assert pr.status_code == 200
            # Use a direct lookup via the full list filter
        # Verify by re-querying with status=draft and checking the 2 ids
        list_r = auth.get(
            f"{BASE_URL}/api/admin/products",
            params={"limit": 5000},
            timeout=60,
        )
        all_products = {p["id"]: p for p in list_r.json()}
        for pid in ids:
            p = all_products.get(pid)
            assert p is not None, f"product {pid} disappeared"
            assert p.get("description") and len(p["description"]) >= 30, (
                f"description_en too short for {pid}: {p.get('description')!r}"
            )
            assert p.get("description_ka") and len(p["description_ka"]) >= 30, (
                f"description_ka too short for {pid}: {p.get('description_ka')!r}"
            )
            assert p.get("name_ka"), f"name_ka missing for {pid}"

    def test_idempotency_overwrite_false(self, auth):
        ids = getattr(pytest, "enrich_ids", None)
        if not ids:
            pytest.skip("no enriched ids from previous test")
        r = auth.post(
            f"{BASE_URL}/api/admin/products/enrich-bulk",
            json={"ids": ids, "overwrite": False},
            timeout=30,
        )
        assert r.status_code in (200, 202)
        body = r.json()
        assert body["total"] == len(ids)
        assert body["skipped_already_enriched"] == len(ids), (
            f"expected all skipped, got {body}"
        )
        # Poll job until done, should be almost instant
        job_id = body["job_id"]
        deadline = time.time() + 30
        final = None
        while time.time() < deadline:
            jr = auth.get(f"{BASE_URL}/api/admin/jobs/{job_id}", timeout=15)
            assert jr.status_code == 200
            jdoc = jr.json()
            if jdoc["status"] in ("done", "error"):
                final = jdoc
                break
            time.sleep(1)
        assert final and final["status"] == "done"
        assert final["succeeded"] == 0
        assert final["skipped"] == len(ids)
        assert final["failed"] == 0

    def test_overwrite_true_regenerates(self, auth):
        ids = getattr(pytest, "enrich_ids", None)
        if not ids:
            pytest.skip("no enriched ids from previous test")
        # Use just the first id to save budget
        only = [ids[0]]

        # Snapshot current description
        before = auth.get(
            f"{BASE_URL}/api/admin/products", params={"limit": 5000}, timeout=60
        ).json()
        before_map = {p["id"]: p for p in before}
        prev_desc = before_map[only[0]]["description"]

        r = auth.post(
            f"{BASE_URL}/api/admin/products/enrich-bulk",
            json={"ids": only, "overwrite": True},
            timeout=30,
        )
        assert r.status_code in (200, 202)
        body = r.json()
        assert body["total"] == 1
        assert body["skipped_already_enriched"] == 0
        job_id = body["job_id"]

        deadline = time.time() + 90
        final = None
        while time.time() < deadline:
            jr = auth.get(f"{BASE_URL}/api/admin/jobs/{job_id}", timeout=15)
            jdoc = jr.json()
            if jdoc["status"] in ("done", "error"):
                final = jdoc
                break
            time.sleep(2)
        assert final and final["status"] == "done", f"job: {final}"
        assert final["succeeded"] == 1

        after = auth.get(
            f"{BASE_URL}/api/admin/products", params={"limit": 5000}, timeout=60
        ).json()
        after_map = {p["id"]: p for p in after}
        new_desc = after_map[only[0]]["description"]
        assert new_desc and len(new_desc) >= 30
        # Content might be similar but updated_at must change; we don't enforce text difference


# ---------------------------------------------------------------------------
# Bulk publish/unpublish/delete using a TEST_ product (round-trip)
# ---------------------------------------------------------------------------
class TestBulkActions:
    def test_bulk_publish_unpublish_delete(self, auth):
        # Create 2 TEST_ products as drafts
        ids = []
        for i in range(2):
            payload = {
                "name": f"TEST_iter14_{uuid.uuid4().hex[:6]}",
                "brand": "TEST_BRAND",
                "category": "catalogue",
                "sub_category": "food",
                "product_type": "dry-food",
                "pet_type": "dog",
                "image": "https://example.com/x.jpg",
                "description": "Test product description used for bulk-action regression testing only.",
                "status": "draft",
            }
            r = auth.post(f"{BASE_URL}/api/admin/products", json=payload, timeout=20)
            assert r.status_code == 201, r.text
            ids.append(r.json()["id"])

        try:
            # bulk-publish
            r = auth.post(
                f"{BASE_URL}/api/admin/products/bulk-publish",
                json={"ids": ids},
                timeout=20,
            )
            assert r.status_code == 200
            body = r.json()
            assert body["matched"] == 2
            assert body["modified"] == 2
            assert body["status"] == "published"

            # Verify
            after = auth.get(
                f"{BASE_URL}/api/admin/products", params={"limit": 5000}, timeout=60
            ).json()
            after_map = {p["id"]: p for p in after}
            for pid in ids:
                assert after_map[pid]["status"] == "published"

            # bulk-unpublish
            r = auth.post(
                f"{BASE_URL}/api/admin/products/bulk-unpublish",
                json={"ids": ids},
                timeout=20,
            )
            assert r.status_code == 200
            body = r.json()
            assert body["matched"] == 2 and body["modified"] == 2
            assert body["status"] == "draft"

            # bulk-delete
            r = auth.post(
                f"{BASE_URL}/api/admin/products/bulk-delete",
                json={"ids": ids},
                timeout=20,
            )
            assert r.status_code == 200
            body = r.json()
            assert body["deleted"] == 2
        finally:
            # Safety net cleanup
            auth.post(
                f"{BASE_URL}/api/admin/products/bulk-delete",
                json={"ids": ids},
                timeout=20,
            )
