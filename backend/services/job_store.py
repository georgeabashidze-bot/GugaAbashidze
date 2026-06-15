"""Lightweight job store for long-running admin operations.

Persists job state to MongoDB collection ``admin_jobs`` so the operator can
close the browser tab and resume polling later. A single process executes the
work via ``asyncio.create_task``; jobs are *not* resilient across backend
restarts (a restarted job will stay in ``running`` state and is treated as
failed by the UI after a reasonable poll timeout).

Public API (all coroutines):
    create_job(db, kind, total, meta=None) -> job_id
    set_running(db, job_id)
    bump_progress(db, job_id, processed=1, succeeded=0, failed=0, last_message=None)
    append_failure(db, job_id, item_id, error)
    complete_job(db, job_id, result=None)
    fail_job(db, job_id, error)
    get_job(db, job_id) -> dict | None
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def create_job(
    db,
    *,
    kind: str,
    total: int,
    meta: Optional[Dict[str, Any]] = None,
) -> str:
    job_id = str(uuid.uuid4())
    doc = {
        "id": job_id,
        "kind": kind,
        "status": "queued",  # queued | running | done | error
        "total": int(total),
        "processed": 0,
        "succeeded": 0,
        "failed": 0,
        "skipped": 0,
        "last_message": None,
        "failures": [],
        "meta": meta or {},
        "result": None,
        "error": None,
        "created_at": _now(),
        "updated_at": _now(),
        "finished_at": None,
    }
    await db.admin_jobs.insert_one(doc)
    return job_id


async def set_running(db, job_id: str) -> None:
    await db.admin_jobs.update_one(
        {"id": job_id},
        {"$set": {"status": "running", "updated_at": _now()}},
    )


async def bump_progress(
    db,
    job_id: str,
    *,
    succeeded: int = 0,
    failed: int = 0,
    skipped: int = 0,
    last_message: Optional[str] = None,
) -> None:
    inc: Dict[str, int] = {"processed": succeeded + failed + skipped}
    if succeeded:
        inc["succeeded"] = succeeded
    if failed:
        inc["failed"] = failed
    if skipped:
        inc["skipped"] = skipped
    set_doc: Dict[str, Any] = {"updated_at": _now()}
    if last_message is not None:
        set_doc["last_message"] = last_message
    await db.admin_jobs.update_one(
        {"id": job_id},
        {"$inc": inc, "$set": set_doc},
    )


async def append_failure(db, job_id: str, *, item_id: str, error: str) -> None:
    await db.admin_jobs.update_one(
        {"id": job_id},
        {"$push": {"failures": {"id": item_id, "error": error[:240]}}},
    )


async def complete_job(
    db, job_id: str, *, result: Optional[Dict[str, Any]] = None
) -> None:
    await db.admin_jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "status": "done",
                "result": result or {},
                "updated_at": _now(),
                "finished_at": _now(),
            }
        },
    )


async def fail_job(db, job_id: str, *, error: str) -> None:
    await db.admin_jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "status": "error",
                "error": error[:500],
                "updated_at": _now(),
                "finished_at": _now(),
            }
        },
    )


async def get_job(db, job_id: str) -> Optional[Dict[str, Any]]:
    doc = await db.admin_jobs.find_one({"id": job_id}, {"_id": 0})
    return doc
