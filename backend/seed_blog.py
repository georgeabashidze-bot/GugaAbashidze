"""Seed `db.blog_posts` from Markdown files in /app/backend/blog_posts.

Each .md file must start with a YAML frontmatter block (between ---).
"""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import List

import yaml

POSTS_DIR = Path(__file__).parent / "blog_posts"


def _parse_markdown(path: Path) -> dict | None:
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        return None
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return None
    frontmatter = yaml.safe_load(parts[1]) or {}
    body = parts[2].lstrip("\n")
    frontmatter["content"] = body
    return frontmatter


def _load_posts() -> List[dict]:
    posts: List[dict] = []
    if not POSTS_DIR.exists():
        return posts
    for p in sorted(POSTS_DIR.glob("*.md")):
        doc = _parse_markdown(p)
        if not doc:
            continue
        doc.setdefault("status", "published")
        # normalise the published_at to ISO string
        published = doc.get("published_at")
        if isinstance(published, datetime):
            doc["published_at"] = published.replace(tzinfo=timezone.utc).isoformat()
        elif isinstance(published, str):
            # already an ISO string — leave as is
            doc["published_at"] = published
        else:
            doc["published_at"] = datetime.now(timezone.utc).isoformat()
        posts.append(doc)
    return posts


async def seed_blog_posts_if_empty(db) -> int:
    existing = await db.blog_posts.count_documents({})
    if existing > 0:
        return 0
    docs = _load_posts()
    if not docs:
        return 0
    await db.blog_posts.insert_many(docs)
    return len(docs)
