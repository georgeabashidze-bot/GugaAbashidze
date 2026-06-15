"""One-off cleanup — strip 'Pre-filled from competitor catalogue; please rewrite...'
boilerplate placeholder text from product descriptions.

Run: python -m backend.scripts.strip_boilerplate
or  : python /app/backend/scripts/strip_boilerplate.py
"""
import os
import re
import asyncio
import sys
from pathlib import Path

# load .env from /app/backend
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from dotenv import load_dotenv  # noqa: E402

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

BOILER_RE = re.compile(
    r"\s*(?:—|-)\s*sold by [\w\.\-]+\.\s*Pre-filled from competitor catalogue;\s*"
    r"please rewrite this description in your own words(?: before publishing)?\.?\s*",
    re.IGNORECASE,
)
LOOSE_RE = re.compile(r"Pre-filled from competitor catalogue|please rewrite this description", re.IGNORECASE)


def clean(text: str) -> str:
    if not text:
        return text
    cleaned = BOILER_RE.sub("", text).strip()
    # If the LOOSE pattern still matches, the format was unexpected — clear the field.
    if LOOSE_RE.search(cleaned):
        return ""
    return cleaned


async def main():
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    cli = AsyncIOMotorClient(mongo_url)
    db = cli[db_name]

    fields = ["description", "description_en", "description_ka", "short_description", "short_description_en", "short_description_ka"]
    or_q = [{f: {"$regex": "Pre-filled from competitor", "$options": "i"}} for f in fields]
    or_q += [{f: {"$regex": "please rewrite this description", "$options": "i"}} for f in fields]

    cursor = db.products.find({"$or": or_q})
    total = 0
    updated = 0
    async for doc in cursor:
        total += 1
        updates = {}
        for f in fields:
            v = doc.get(f)
            if isinstance(v, str) and LOOSE_RE.search(v):
                new_v = clean(v)
                if new_v != v:
                    updates[f] = new_v
        if updates:
            await db.products.update_one({"_id": doc["_id"]}, {"$set": updates})
            updated += 1

    print(f"Inspected {total} products, cleaned {updated}.")
    cli.close()


if __name__ == "__main__":
    asyncio.run(main())
