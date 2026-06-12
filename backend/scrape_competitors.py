"""Competitor scraper for SmartPaw bulk-import.

Targets smartpet.ge (primary; reachable, rich CSCart catalogue) and zoomart.ge
(secondary; reachable). micropet.ge and zoostandard.ge are NOT reachable from
the container.

Mapping smartpet.ge categories → our 6 sub_categories:
    food            ← dry-food-ka, wet-food-ka, treats-ka
    hygiene         ← hygiene-ka, cosmetics-ka
    vitamins        ← supplements-ka, medications-ka
    toys-accessories← toys-ka, accessories-ka, furniture/beds-ka, furniture/bowls-ka

innovation-tech & services are left empty (competitor retailers don't sell
smart feeders / care services). The user will add those manually.

Output: /app/backend/uploads/smartpaw-import-<timestamp>.xlsx with every row
ready to be reviewed and re-uploaded through the Bulk Import page.
"""

from __future__ import annotations

import re
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter


UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ka-GE,ka;q=0.9,en-US;q=0.8,en;q=0.7",
}

# How many products to collect per sub-category from smartpet.ge.
TARGET_PER_SUBCATEGORY = 20


# ============================================================================
# SMARTPET.GE — CSCART based, very predictable HTML
# ============================================================================
SMARTPET_BASE = "https://smartpet.ge"
SMARTPET_CATEGORIES: List[Tuple[str, str]] = [
    # (URL slug, our sub_category)
    ("/dry-food-ka/", "food"),
    ("/wet-food-ka/", "food"),
    ("/treats-ka/", "food"),
    ("/cosmetics-ka/", "hygiene"),
    ("/hygiene-ka/", "hygiene"),
    ("/supplements-ka/", "vitamins"),
    ("/medications-ka/", "vitamins"),
    ("/toys-ka/", "toys-accessories"),
    ("/accessories-ka/", "toys-accessories"),
    ("/furniture/beds-ka/", "toys-accessories"),
    ("/furniture/bowls-ka/", "toys-accessories"),
]


def _parse_smartpet_price(card) -> Optional[float]:
    """Smartpet renders price as `<span class="ty-price-num">10<sup>00</sup>` => 10.00."""
    price_span = card.select_one(".ty-price .ty-price-num")
    if not price_span:
        return None
    text = price_span.get_text(" ", strip=True)
    # Pattern: "10 00" or "10" — first number is integer part, optional supremum is decimals.
    sup = price_span.find("sup")
    integer_part = re.sub(r"\D", "", price_span.contents[0] if price_span.contents else "")
    decimal_part = re.sub(r"\D", "", sup.get_text() if sup else "") or "0"
    if not integer_part:
        # fallback: pull biggest number
        m = re.search(r"\d+", text)
        if not m:
            return None
        return float(m.group(0))
    try:
        return float(f"{integer_part}.{decimal_part}")
    except ValueError:
        return None


def _smartpet_brand(card) -> Optional[str]:
    """Try to derive a brand. CSCart sometimes puts a brand logo in `.brand-img img`
    with the brand name in alt/title. As a fallback, take the first word of the title."""
    brand_img = card.select_one(".brand-img img")
    if brand_img:
        alt = (brand_img.get("alt") or brand_img.get("title") or "").strip()
        if alt:
            return alt
        # logo filename often contains the brand name
        src = brand_img.get("src") or ""
        m = re.search(r"/feature_variant/\d+/([a-z0-9_\-]+)_logo", src, re.IGNORECASE)
        if m:
            return m.group(1).replace("_", " ").title()
    return None


def _detect_size(name: str) -> Optional[str]:
    """Extract size from a product name (e.g. '2kg', '300 ml', '12 KG')."""
    m = re.search(r"(\d{1,3}(?:[.,]\d+)?)\s?(kg|gr|g|ml|l)\b", name, re.IGNORECASE)
    if m:
        amount = m.group(1).replace(",", ".")
        unit = m.group(2).lower()
        return f"{amount} {unit}"
    return None


def _guess_pet_type(name: str, category_url: str) -> str:
    n = name.lower()
    # smartpet categorizes pup/kitten/adult etc — names include 'puppy', 'cat', 'kitten', 'dog'
    if any(k in n for k in (" cat", " kitten", " feline")) or "kitten" in category_url:
        return "cat"
    if any(k in n for k in (" dog", " puppy", " canine")) or "puppy" in category_url:
        return "dog"
    return "both"


def scrape_smartpet_listing(path: str, sub_category: str, limit: int) -> List[Dict]:
    """Scrape a smartpet category page (single page, ~20-40 cards is plenty)."""
    url = urljoin(SMARTPET_BASE, path)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=25)
    except requests.RequestException as e:
        print(f"  ! {url} failed: {e}")
        return []
    if resp.status_code != 200:
        print(f"  ! {url} returned {resp.status_code}")
        return []
    soup = BeautifulSoup(resp.text, "lxml")
    cards = soup.select(".ut2-gl__item")
    rows: List[Dict] = []
    seen_slugs: set = set()
    for card in cards:
        if len(rows) >= limit:
            break
        name_anchor = card.select_one(".ut2-gl__name a") or card.select_one("a.product-title")
        if not name_anchor:
            continue
        name = (name_anchor.get("title") or name_anchor.get_text(" ", strip=True) or "").strip()
        if not name:
            continue

        # Image: first <img> inside the image block
        img_el = card.select_one(".ut2-gl__image img") or card.select_one("img.img-ab-hover-gallery")
        image_url = ""
        if img_el and img_el.get("src"):
            src = img_el["src"].strip()
            # Smartpet thumbnails: /images/thumbnails/240/290/detailed/... — try to grab a bigger size.
            big = re.sub(r"/thumbnails/\d+/\d+/", "/thumbnails/800/800/", src)
            image_url = urljoin(SMARTPET_BASE, big or src)

        price = _parse_smartpet_price(card)

        brand = _smartpet_brand(card) or name.split()[0].title()
        size = _detect_size(name)
        pet_type = _guess_pet_type(name, path)

        # Slug from product URL when possible (CSCart includes a slug)
        href = name_anchor.get("href") or ""
        slug_match = re.search(r"/([a-z0-9\-]+)/?(?:\?|$)", href.rstrip("/"))
        slug = slug_match.group(1).lower() if slug_match else re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:80]
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        # Description: short, factual — use the product name + size + brand
        # User will rewrite during review.
        description = (
            f"{name} — sold by smartpet.ge. Pre-filled from competitor catalogue; "
            "please rewrite this description in your own words before publishing."
        )

        rows.append({
            "name": name,
            "name_ka": "",
            "brand": brand,
            "category": "catalogue",
            "sub_category": sub_category,
            "pet_type": pet_type,
            "size": size or "",
            "price": price,
            "currency": "GEL",
            "image_url": image_url,
            "description": description,
            "description_ka": "",
            "tags": "",
            "featured": "FALSE",
            "status": "published",
            "slug": slug,
            "_source_url": urljoin(SMARTPET_BASE, href),
        })
    return rows


# ============================================================================
# ZOOMART.GE — Magento-ish, products in .product-card-product
# ============================================================================
ZOOMART_BASE = "https://zoomart.ge"
ZOOMART_PAGES: List[Tuple[str, str]] = [
    ("/dogs/dzaghli-sakvebi", "food"),
    ("/cats/katis-sakvebi", "food"),
]


def scrape_zoomart_listing(path: str, sub_category: str, limit: int) -> List[Dict]:
    url = urljoin(ZOOMART_BASE, path)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=25)
    except requests.RequestException as e:
        print(f"  ! {url} failed: {e}")
        return []
    if resp.status_code != 200:
        print(f"  ! {url} returned {resp.status_code}")
        return []
    soup = BeautifulSoup(resp.text, "lxml")
    # zoomart card class observed: each <a class="product-card-product"> wraps a card
    cards = soup.select("a.product-card-product, .product-card-product, [class*='product-card']")
    rows: List[Dict] = []
    seen: set = set()
    for card in cards:
        if len(rows) >= limit:
            break
        # Name
        name_el = card.select_one(".product-card-name, [class*='product-name'], h3, h4")
        if not name_el:
            continue
        name = name_el.get_text(" ", strip=True)
        if not name or len(name) < 4:
            continue

        # Price — look for currency symbol ₾
        price = None
        for el in card.select("[class*='price']"):
            text = el.get_text(" ", strip=True)
            m = re.search(r"(\d+(?:[.,]\d+)?)\s*[₾]", text)
            if not m:
                m = re.search(r"(\d+(?:[.,]\d+)?)\s*GEL", text, re.IGNORECASE)
            if m:
                price = float(m.group(1).replace(",", "."))
                break

        # Image
        img_el = card.select_one("img")
        image_url = ""
        if img_el:
            src = (
                img_el.get("data-src")
                or img_el.get("data-lazy")
                or img_el.get("src")
                or ""
            ).strip()
            if src.startswith("//"):
                src = f"https:{src}"
            image_url = urljoin(ZOOMART_BASE, src)

        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:80]
        if slug in seen:
            continue
        seen.add(slug)

        rows.append({
            "name": name,
            "name_ka": "",
            "brand": name.split()[0].title(),
            "category": "catalogue",
            "sub_category": sub_category,
            "pet_type": "cat" if "cat" in path else "dog",
            "size": _detect_size(name) or "",
            "price": price,
            "currency": "GEL",
            "image_url": image_url,
            "description": (
                f"{name} — sold by zoomart.ge. Pre-filled from competitor "
                "catalogue; please rewrite this description in your own words."
            ),
            "description_ka": "",
            "tags": "",
            "featured": "FALSE",
            "status": "published",
            "slug": f"zoomart-{slug}",
            "_source_url": url,
        })
    return rows


# ============================================================================
# EXCEL BUILDER
# ============================================================================
COLUMNS = [
    "name", "name_ka", "brand", "category", "sub_category", "pet_type",
    "size", "price", "currency", "image_url", "description", "description_ka",
    "tags", "featured", "status", "slug",
]


def build_workbook(rows: List[Dict]) -> Workbook:
    wb = Workbook()
    ws = wb.active
    ws.title = "Products"

    # Header row matches the import template exactly
    header_fill = PatternFill(start_color="FF0A4D8C", end_color="FF0A4D8C", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFFFF", size=11)
    for idx, col in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=idx, value=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="left", vertical="center")
        # rough widths
        widths = {
            "name": 42, "name_ka": 32, "brand": 22, "category": 12,
            "sub_category": 18, "pet_type": 10, "size": 12, "price": 10,
            "currency": 10, "image_url": 60, "description": 65,
            "description_ka": 40, "tags": 22, "featured": 10, "status": 12,
            "slug": 32,
        }
        ws.column_dimensions[get_column_letter(idx)].width = widths.get(col, 18)

    ws.freeze_panes = "A2"

    for r_idx, row in enumerate(rows, start=2):
        for c_idx, key in enumerate(COLUMNS, start=1):
            ws.cell(row=r_idx, column=c_idx, value=row.get(key, ""))

    # Reference sheet listing the source URL per row (so user can verify)
    ref = wb.create_sheet("Sources")
    ref.append(["Row in 'Products' sheet", "Source URL"])
    ref.column_dimensions["A"].width = 24
    ref.column_dimensions["B"].width = 90
    for r_idx, row in enumerate(rows, start=2):
        ref.cell(row=r_idx, column=1, value=r_idx)
        ref.cell(row=r_idx, column=2, value=row.get("_source_url", ""))

    return wb


def main() -> Path:
    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting competitor scrape")
    all_rows: List[Dict] = []
    by_sub: Dict[str, int] = {}

    for path, sub in SMARTPET_CATEGORIES:
        print(f"  → smartpet.ge {path}  (target sub_category: {sub})")
        before = len(all_rows)
        rows = scrape_smartpet_listing(path, sub, TARGET_PER_SUBCATEGORY)
        all_rows.extend(rows)
        added = len(all_rows) - before
        by_sub[sub] = by_sub.get(sub, 0) + added
        print(f"    + {added} products")
        time.sleep(1.2)  # be polite

    for path, sub in ZOOMART_PAGES:
        print(f"  → zoomart.ge {path}  (target sub_category: {sub})")
        before = len(all_rows)
        rows = scrape_zoomart_listing(path, sub, 15)
        all_rows.extend(rows)
        added = len(all_rows) - before
        by_sub[sub] = by_sub.get(sub, 0) + added
        print(f"    + {added} products")
        time.sleep(1.2)

    print(f"\nTotal collected: {len(all_rows)} products")
    print("By sub_category:")
    for k, v in sorted(by_sub.items()):
        print(f"  {k}: {v}")

    # Save
    out_dir = Path("/app/backend/uploads")
    out_dir.mkdir(parents=True, exist_ok=True)
    fname = f"smartpaw-import-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}.xlsx"
    out_path = out_dir / fname
    wb = build_workbook(all_rows)
    wb.save(out_path)
    print(f"\nWrote: {out_path}")
    print(f"Public URL: /api/uploads/{fname}")
    return out_path


if __name__ == "__main__":
    main()
