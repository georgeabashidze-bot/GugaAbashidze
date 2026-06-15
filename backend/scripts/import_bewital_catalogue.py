"""Bewital partner catalogue ingestion pipeline.

Parses the partner Excel pricelist (`bewital_pricelist.xlsx`), derives brand /
sub_category / product_type / pet_type per row, calls the Emergent LLM (Claude
Haiku 4.5) to enrich each product with bilingual (EN + KA) name, description and
tags, then upserts every product into MongoDB as `status: "draft"`.

Two entry points:

1. Standalone CLI:
       python -m backend.scripts.import_bewital_catalogue
   (or)  python /app/backend/scripts/import_bewital_catalogue.py
   – Connects to MongoDB itself using MONGO_URL/DB_NAME from backend/.env.

2. Programmatic (admin endpoint):
       summary = await run_import(db, public_base, dry_run=False)
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

# Allow running standalone from anywhere
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

DATA_FILE = Path(__file__).parent / "data" / "bewital_pricelist.xlsx"


# ============================================================================
# BRAND / SUB-CATEGORY DERIVATION
# ============================================================================
# Brand placeholders — used when no scraped image is available. The user
# explicitly chose: "Use a generic brand placeholder" as fallback.
BRAND_PLACEHOLDERS: Dict[str, str] = {
    "Belcando": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80",  # dry dog food bag
    "Bewi Dog": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80",
    "Bewi Cat": "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80",  # cat food
    "Leonardo": "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80",
    "R-Line": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",  # dog chew
    "4 Dogs": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",
}
DEFAULT_PLACEHOLDER = (
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80"
)


def detect_brand(name: str) -> str:
    n = name.lower()
    if "belcando" in n:
        return "Belcando"
    if "bewi dog" in n:
        return "Bewi Dog"
    if "bewi cat" in n:
        return "Bewi Cat"
    if "leonardo" in n:
        return "Leonardo"
    if "r-line" in n or "r line" in n:
        return "R-Line"
    if "himalayan" in n or "rope toy" in n or "dog cookies" in n or "training dog" in n:
        return "4 Dogs"
    return "Bewital"


def classify(name: str, section: Optional[str], sheet: str) -> Tuple[str, Optional[str], str]:
    """Return (sub_category, product_type, pet_type).

    sub_category ∈ food | vitamins | toys-accessories
    product_type ∈ dry-food | wet-food | snacks | other (only when food)
    pet_type     ∈ cat | dog
    """
    n = name.lower()
    sec = (section or "").lower()
    sheet_l = sheet.lower()

    # pet_type
    if "cat" in sheet_l or "leonardo" in n or "bewi cat" in n:
        pet_type = "cat"
    else:
        pet_type = "dog"

    # toys-accessories: ropes only
    if "rope toy" in n:
        return ("toys-accessories", None, pet_type)

    # vitamins/supplements
    if "tabs" in sec or "tab" in n.split() or "vitamin" in n:
        return ("vitamins", None, pet_type)

    # explicit snack-ish keywords
    snack_kw = ("snack", "chew", "cookies", "antler", "himalayan", "training dog")
    if any(k in n for k in snack_kw) or "snacks" in sec or "chews" in sheet_l:
        return ("food", "snacks", pet_type)

    # wet food
    if "wet" in sec or any(
        k in n for k in (" wet", "gravy", "pure ", "rich in", "kitten poultry", "85g", "70g", "150g", "200g", "400g", "800g", "1240g")
    ):
        # gravy/pâté/cans
        if "gravy" in n and "puppy gravy" in n:  # Belcando Puppy Gravy bags (dry) actually
            # The Belcando "Puppy Gravy" lines (557015/557025) are in the dry section
            # – section will steer them correctly. If section says WET we're wet.
            if "wet" in sec:
                return ("food", "wet-food", pet_type)
            return ("food", "dry-food", pet_type)
        return ("food", "wet-food", pet_type)

    # milk replacer
    if "milk" in n:
        return ("food", "other", pet_type)

    # default: dry food
    return ("food", "dry-food", pet_type)


SIZE_RE_PAREN = re.compile(r"\(([0-9]+[.,]?[0-9]*)\s*(kg|g|ml)?\)", re.I)
SIZE_RE_SUFFIX = re.compile(r"([0-9]+[.,]?[0-9]*)\s*(kg|g|ml|gr)\b", re.I)


def extract_size(name: str) -> Optional[str]:
    m = SIZE_RE_PAREN.search(name)
    if m:
        n = m.group(1).replace(",", ".")
        unit = (m.group(2) or "kg").lower()
        if unit == "gr":
            unit = "g"
        return f"{n} {unit}"
    m = SIZE_RE_SUFFIX.search(name)
    if m:
        n = m.group(1).replace(",", ".")
        unit = m.group(2).lower()
        if unit == "gr":
            unit = "g"
        return f"{n} {unit}"
    return None


SLUG_RE = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    base = SLUG_RE.sub("-", text.lower()).strip("-")
    return base or f"product-{uuid.uuid4().hex[:8]}"


def clean_name(name: str) -> str:
    # Strip trailing '*' (footnote marker in the pricelist) and excess spaces
    return re.sub(r"\s+", " ", name.replace("*", "").strip())


# ============================================================================
# EXCEL PARSING
# ============================================================================
def parse_pricelist(path: Path) -> List[Dict[str, Any]]:
    """Return a list of raw parsed product dicts (pre-LLM)."""
    xls = pd.ExcelFile(path)
    out: List[Dict[str, Any]] = []

    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet, header=None)
        section: Optional[str] = None

        for _, row in df.iterrows():
            c0 = row.iloc[0] if len(row) > 0 else None
            c1 = row.iloc[1] if len(row) > 1 else None
            c2 = row.iloc[2] if len(row) > 2 else None

            # Header row
            if isinstance(c0, str) and c0.strip().lower() == "code":
                continue

            # Empty
            if (c0 is None or (isinstance(c0, float) and pd.isna(c0))) and (
                c1 is None or (isinstance(c1, float) and pd.isna(c1))
            ):
                continue

            # Section header (col0 empty, col1 is uppercase string)
            if (c0 is None or (isinstance(c0, float) and pd.isna(c0))) and isinstance(
                c1, str
            ) and c1.strip().isupper():
                section = c1.strip()
                continue

            # Data row
            if not isinstance(c1, str) or not c1.strip():
                continue
            if c2 is None or (isinstance(c2, float) and pd.isna(c2)):
                continue
            try:
                price = float(c2)
            except (TypeError, ValueError):
                continue

            raw_name = c1
            name = clean_name(raw_name)
            barcode = str(c0).strip().split(".")[0] if c0 is not None else None
            brand = detect_brand(name)
            sub_category, product_type, pet_type = classify(name, section, sheet)
            size = extract_size(raw_name)

            out.append({
                "sheet": sheet,
                "section": section,
                "raw_name": raw_name,
                "name": name,
                "barcode": barcode,
                "price": price,
                "brand": brand,
                "sub_category": sub_category,
                "product_type": product_type,
                "pet_type": pet_type,
                "size": size,
            })
    return out


# ============================================================================
# LLM ENRICHMENT
# ============================================================================
ENRICH_SYSTEM = (
    "You write product copy for SmartPaw Food, a Tbilisi-based premium pet food "
    "delivery store. Output ONLY valid minified JSON. No prose, no markdown, no "
    "code fences. Keys must be exactly: name_en, name_ka, description_en, "
    "description_ka, tags, size_label. Descriptions are 90–160 characters, "
    "vivid, benefit-led, factual about life stage / protein / size when known. "
    "name_ka is the EN name transliterated into Georgian when it's a proper "
    "brand line (e.g. 'Belcando Adult Active 12.5 kg' → 'ბელკანდო Adult Active "
    "12.5 კგ'). description_ka is a native Georgian description (NOT a "
    "machine-translation feel). tags is an array of exactly 5 short, "
    "lowercase, hyphenated English tags."
)


def build_enrich_prompt(p: Dict[str, Any]) -> str:
    return (
        "Enrich this pet food product. Respond with the JSON only.\n\n"
        f"Brand: {p['brand']}\n"
        f"Raw name: {p['name']}\n"
        f"Pet: {p['pet_type']}\n"
        f"Category: {p['sub_category']}"
        f"{' / ' + p['product_type'] if p['product_type'] else ''}\n"
        f"Pack size (parsed): {p.get('size') or 'unknown'}\n"
        f"Price (GEL): {p['price']}\n"
        f"Source section: {p.get('section') or p['sheet']}\n"
    )


def _safe_json_loads(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    # Strip code fences if model wrapped output
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    # First JSON object in string
    m = re.search(r"\{[\s\S]*\}", cleaned)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


async def enrich_one(api_key: str, p: Dict[str, Any]) -> Dict[str, Any]:
    """Call Claude Haiku once per product. On failure, return a sensible
    monolingual fallback so the row still imports."""
    session_id = f"bewital-{slugify(p['name'])[:48]}"
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=ENRICH_SYSTEM,
        ).with_model("anthropic", "claude-haiku-4-5-20251001")
        resp = await chat.send_message(UserMessage(text=build_enrich_prompt(p)))
        data = _safe_json_loads(resp if isinstance(resp, str) else str(resp))
        if not data:
            raise RuntimeError("LLM response was not valid JSON")

        name_en = (data.get("name_en") or p["name"]).strip()
        name_ka = (data.get("name_ka") or "").strip() or None
        desc_en = (data.get("description_en") or "").strip()
        desc_ka = (data.get("description_ka") or "").strip() or None
        tags = data.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in re.split(r"[,;]", tags) if t.strip()]
        tags = [str(t).strip().lower() for t in tags if str(t).strip()][:6]
        size_label = (data.get("size_label") or p.get("size") or "").strip() or None

        if not desc_en:
            desc_en = f"Premium {p['brand']} formula for your {p['pet_type']}."
        return {
            "name_en": name_en,
            "name_ka": name_ka,
            "description_en": desc_en,
            "description_ka": desc_ka,
            "tags": tags,
            "size": size_label or p.get("size"),
            "llm_ok": True,
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "name_en": p["name"],
            "name_ka": None,
            "description_en": (
                f"{p['brand']} {p.get('product_type') or 'product'} for "
                f"{p['pet_type']}s. Pack size: {p.get('size') or 'standard'}."
            ),
            "description_ka": None,
            "tags": [p["brand"].lower(), p["pet_type"], p.get("product_type") or "food"],
            "size": p.get("size"),
            "llm_ok": False,
            "llm_error": str(exc)[:200],
        }


async def enrich_batch(
    api_key: str, items: List[Dict[str, Any]], concurrency: int = 4
) -> List[Dict[str, Any]]:
    sem = asyncio.Semaphore(concurrency)

    async def _wrap(p):
        async with sem:
            return await enrich_one(api_key, p)

    return await asyncio.gather(*[_wrap(p) for p in items])


# ============================================================================
# MONGO UPSERT
# ============================================================================
def build_document(raw: Dict[str, Any], enriched: Dict[str, Any]) -> Dict[str, Any]:
    name = enriched["name_en"]
    slug = slugify(name)
    now_iso = datetime.now(timezone.utc).isoformat()
    image = BRAND_PLACEHOLDERS.get(raw["brand"], DEFAULT_PLACEHOLDER)

    return {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "name": name,
        "name_ka": enriched.get("name_ka"),
        "brand": raw["brand"],
        "category": "catalogue",
        "sub_category": raw["sub_category"],
        "product_type": raw["product_type"],
        "pet_type": raw["pet_type"],
        "size": enriched.get("size") or raw.get("size"),
        "price": raw["price"],
        "currency": "GEL",
        "image": image,
        "description": enriched["description_en"],
        "description_ka": enriched.get("description_ka"),
        "tags": enriched.get("tags") or [],
        "featured": False,
        "status": "draft",
        "barcode": raw.get("barcode"),
        "source": "bewital_pricelist",
        "created_at": now_iso,
        "updated_at": now_iso,
    }


async def upsert_products(db, docs: List[Dict[str, Any]], dry_run: bool) -> Dict[str, int]:
    """Skip-on-duplicate insert (user choice: 4a). Existing products are left
    untouched; only brand-new slugs are inserted."""
    inserted, skipped = 0, 0
    for doc in docs:
        existing = await db.products.find_one({"slug": doc["slug"]}, {"_id": 1})
        if existing:
            skipped += 1
            continue
        if not dry_run:
            await db.products.insert_one(doc)
        inserted += 1
    return {"inserted": inserted, "skipped": skipped, "updated": 0}


# ============================================================================
# PUBLIC ENTRY POINTS
# ============================================================================
async def run_import(
    db,
    *,
    excel_path: Path = DATA_FILE,
    dry_run: bool = False,
    concurrency: int = 4,
    limit: Optional[int] = None,
) -> Dict[str, Any]:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from backend/.env")
    if not excel_path.exists():
        raise RuntimeError(f"Excel file not found: {excel_path}")

    raw_rows = parse_pricelist(excel_path)
    if limit:
        raw_rows = raw_rows[:limit]

    enriched = await enrich_batch(api_key, raw_rows, concurrency=concurrency)
    docs = [build_document(r, e) for r, e in zip(raw_rows, enriched)]
    result = await upsert_products(db, docs, dry_run=dry_run)

    llm_failures = [
        {"name": r["name"], "error": e.get("llm_error")}
        for r, e in zip(raw_rows, enriched)
        if not e.get("llm_ok")
    ]
    by_brand: Dict[str, int] = {}
    by_pet: Dict[str, int] = {}
    for d in docs:
        by_brand[d["brand"]] = by_brand.get(d["brand"], 0) + 1
        by_pet[d["pet_type"]] = by_pet.get(d["pet_type"], 0) + 1

    return {
        "total_parsed": len(raw_rows),
        "inserted": result["inserted"],
        "updated": result["updated"],
        "skipped": result.get("skipped", 0),
        "by_brand": by_brand,
        "by_pet_type": by_pet,
        "llm_failures": llm_failures[:25],
        "llm_failure_count": len(llm_failures),
        "dry_run": dry_run,
        "status_used": "draft",
        "currency": "GEL",
    }


async def _main():
    from motor.motor_asyncio import AsyncIOMotorClient

    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    limit_arg = next((a for a in args if a.startswith("--limit=")), None)
    limit = int(limit_arg.split("=", 1)[1]) if limit_arg else None

    print(f"[bewital-import] dry_run={dry_run} limit={limit}")
    summary = await run_import(db, dry_run=dry_run, limit=limit)
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    client.close()


if __name__ == "__main__":
    asyncio.run(_main())
