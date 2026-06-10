"""Promo banner seed for the Special Offers engine."""

from datetime import datetime, timezone, timedelta
import uuid


def _iso(dt):
    return dt.replace(microsecond=0, tzinfo=timezone.utc).isoformat()


def _build_promos():
    now = datetime.now(timezone.utc)
    return [
        {
            "id": str(uuid.uuid4()),
            "slug": "free-feeder-annual",
            "title": "Free SmartPaw Feeder",
            "subtitle": "Sign up to an annual plan and receive our Wi-Fi feeder — set up and synced for you.",
            "badge": "Launch perk",
            "cta_label": "Claim it",
            "cta_route": "/special-offers/innovation-tech",
            "image": "https://images.pexels.com/photos/27435433/pexels-photo-27435433.jpeg?auto=compress&cs=tinysrgb&w=1600",
            "accent": "#F25C05",
            "starts_at": _iso(now - timedelta(days=2)),
            "ends_at": _iso(now + timedelta(days=120)),
            "active": True,
            "order": 1,
        },
        {
            "id": str(uuid.uuid4()),
            "slug": "winter-toys-bundle",
            "title": "Winter toys bundle, –20%",
            "subtitle": "Rope, Kong and a thermal bed — wrapped together. Keeps boredom (and cold paws) out.",
            "badge": "Seasonal",
            "cta_label": "Browse toys",
            "cta_route": "/special-offers/toys-accessories",
            "image": "https://images.pexels.com/photos/3361739/pexels-photo-3361739.jpeg?auto=compress&cs=tinysrgb&w=1600",
            "accent": "#0A4D8C",
            "starts_at": _iso(now - timedelta(days=10)),
            "ends_at": _iso(now + timedelta(days=45)),
            "active": True,
            "order": 2,
        },
        {
            "id": str(uuid.uuid4()),
            "slug": "first-groom-half",
            "title": "First mobile groom at 50%",
            "subtitle": "Book a home grooming session through any plan — pay half on the first visit. Tbilisi only.",
            "badge": "New customers",
            "cta_label": "Book grooming",
            "cta_route": "/special-offers/services",
            "image": "https://images.pexels.com/photos/6816858/pexels-photo-6816858.jpeg?auto=compress&cs=tinysrgb&w=1600",
            "accent": "#F25C05",
            "starts_at": _iso(now - timedelta(days=5)),
            "ends_at": _iso(now + timedelta(days=60)),
            "active": True,
            "order": 3,
        },
    ]


async def seed_promos_if_empty(db) -> int:
    existing = await db.promos.count_documents({})
    if existing > 0:
        return 0
    docs = _build_promos()
    if docs:
        await db.promos.insert_many(docs)
        await db.promos.create_index("slug", unique=True)
        await db.promos.create_index([("active", 1), ("order", 1)])
    return len(docs)
