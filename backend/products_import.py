"""Excel/CSV bulk import for Products.

Provides:
- `/api/admin/products/import/template` — download a pre-styled .xlsx template
  with column headers, validation hints and an example row.
- `/api/admin/products/import` — accepts an uploaded .xlsx file, parses every
  row, upserts each product by `slug` (auto-derived from `name` when missing),
  optionally downloads remote `image_url` values into our `/uploads` folder so
  the catalogue keeps working even if the source URL changes, and returns a
  per-row import summary.

Behaviour matches the user-confirmed choice (d-ii): upsert by slug. Existing
products are updated in place; new ones are inserted. Nothing is wiped.
"""

from __future__ import annotations

import io
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import requests
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

from auth import get_current_admin


import_router = APIRouter(prefix="/api/admin/products/import", tags=["admin", "import"])


# ============================================================================
# TEMPLATE SCHEMA
# ============================================================================
# Each tuple: (header, width, hint shown under the header row)
TEMPLATE_COLUMNS: List[Tuple[str, int, str]] = [
    ("name", 38, "REQUIRED · Product name in English"),
    ("name_ka", 38, "Product name in Georgian (optional but recommended)"),
    ("brand", 22, "REQUIRED · Brand or supplier name"),
    ("category", 14, "REQUIRED · catalogue | specials"),
    ("sub_category", 22, "REQUIRED · food | hygiene | vitamins | toys-accessories | innovation-tech | services"),
    ("product_type", 18, "Only for food / hygiene. Food: dry-food | wet-food | snacks | other. Hygiene: teeth-care | grooming | pads | other"),
    ("pet_type", 12, "dog | cat | both  (default: both)"),
    ("size", 18, "e.g. 2 kg, 12 kg, 250 ml — optional"),
    ("price", 12, "Numeric price (e.g. 79.90)"),
    ("currency", 10, "Currency code, default GEL"),
    ("image_url", 60, "Public URL to product image — will be downloaded & hosted by us"),
    ("description", 70, "REQUIRED · English description (up to 4000 chars)"),
    ("description_ka", 70, "Georgian description (optional)"),
    ("tags", 30, "Comma-separated tags, e.g. grain-free, large-breed"),
    ("featured", 10, "TRUE / FALSE (default FALSE)"),
    ("status", 12, "draft | published (default published)"),
    ("slug", 28, "Optional manual slug — auto-generated from name if blank"),
]

CATEGORY_VALUES = ("catalogue", "specials")
SUB_CATEGORY_VALUES = (
    "food",
    "hygiene",
    "vitamins",
    "toys-accessories",
    "innovation-tech",
    "services",
)
FOOD_TYPE_VALUES = ("dry-food", "wet-food", "snacks", "other")
HYGIENE_TYPE_VALUES = ("teeth-care", "grooming", "pads", "other")
PRODUCT_TYPE_VALUES = tuple(dict.fromkeys(FOOD_TYPE_VALUES + HYGIENE_TYPE_VALUES))
PET_TYPE_VALUES = ("dog", "cat", "both")
STATUS_VALUES = ("draft", "published")


SLUG_RE = re.compile(r"[^a-z0-9]+")


def _slugify(text: str) -> str:
    base = SLUG_RE.sub("-", (text or "").lower()).strip("-")
    return base or f"product-{uuid.uuid4().hex[:8]}"


# ============================================================================
# TEMPLATE BUILDER
# ============================================================================
def _build_template_workbook() -> Workbook:
    wb = Workbook()
    ws = wb.active
    ws.title = "Products"

    header_fill = PatternFill(start_color="FF0A4D8C", end_color="FF0A4D8C", fill_type="solid")
    hint_fill = PatternFill(start_color="FFF1F4F8", end_color="FFF1F4F8", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFFFF", size=11)
    hint_font = Font(italic=True, color="FF465B70", size=9)

    # Row 1 = column headers
    for col_idx, (header, width, _hint) in enumerate(TEMPLATE_COLUMNS, start=1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="left", vertical="center")
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    # Row 2 = hints (italic, light fill)
    for col_idx, (_header, _width, hint) in enumerate(TEMPLATE_COLUMNS, start=1):
        cell = ws.cell(row=2, column=col_idx, value=hint)
        cell.fill = hint_fill
        cell.font = hint_font
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws.row_dimensions[1].height = 22
    ws.row_dimensions[2].height = 32
    ws.freeze_panes = "A3"

    # Row 3 = example row (real-looking values)
    example: Dict[str, Any] = {
        "name": "Royal Canin Maxi Adult 15kg",
        "name_ka": "Royal Canin Maxi Adult 15კგ",
        "brand": "Royal Canin",
        "category": "catalogue",
        "sub_category": "food",
        "product_type": "dry-food",
        "pet_type": "dog",
        "size": "15 kg",
        "price": 219.00,
        "currency": "GEL",
        "image_url": "https://images.unsplash.com/photo-1601758174039-bcdd2b9d2f3e?w=900",
        "description": "Complete dry food for adult large-breed dogs (26–44 kg) from 15 months to 5 years.",
        "description_ka": "სრულფასოვანი მშრალი საკვები მსხვილი ჯიშის ზრდასრული ძაღლებისთვის.",
        "tags": "large-breed, adult, dry-food",
        "featured": False,
        "status": "published",
        "slug": "",
    }
    for col_idx, (header, _w, _h) in enumerate(TEMPLATE_COLUMNS, start=1):
        ws.cell(row=3, column=col_idx, value=example.get(header))

    # Data validations on key dropdown columns (applied to rows 3-1000)
    def add_dv(values: Tuple[str, ...], column_letter: str) -> None:
        dv = DataValidation(
            type="list",
            formula1='"' + ",".join(values) + '"',
            allow_blank=True,
            showErrorMessage=True,
            errorTitle="Invalid value",
            error=f"Allowed values: {', '.join(values)}",
        )
        ws.add_data_validation(dv)
        dv.add(f"{column_letter}3:{column_letter}1000")

    headers = [c[0] for c in TEMPLATE_COLUMNS]
    add_dv(CATEGORY_VALUES, get_column_letter(headers.index("category") + 1))
    add_dv(SUB_CATEGORY_VALUES, get_column_letter(headers.index("sub_category") + 1))
    add_dv(PRODUCT_TYPE_VALUES, get_column_letter(headers.index("product_type") + 1))
    add_dv(PET_TYPE_VALUES, get_column_letter(headers.index("pet_type") + 1))
    add_dv(STATUS_VALUES, get_column_letter(headers.index("status") + 1))
    add_dv(("TRUE", "FALSE"), get_column_letter(headers.index("featured") + 1))

    # Second sheet: column reference
    ref = wb.create_sheet("Field guide")
    ref.column_dimensions["A"].width = 22
    ref.column_dimensions["B"].width = 95
    ref.cell(row=1, column=1, value="Column").font = Font(bold=True)
    ref.cell(row=1, column=2, value="Description").font = Font(bold=True)
    for idx, (header, _w, hint) in enumerate(TEMPLATE_COLUMNS, start=2):
        ref.cell(row=idx, column=1, value=header)
        ref.cell(row=idx, column=2, value=hint).alignment = Alignment(wrap_text=True)
    ref.cell(row=len(TEMPLATE_COLUMNS) + 3, column=1, value="Tip").font = Font(bold=True, italic=True)
    ref.cell(
        row=len(TEMPLATE_COLUMNS) + 3,
        column=2,
        value=(
            "Rows are upserted by slug. If a slug already exists in the database "
            "the row UPDATES it; otherwise a new product is created. Delete the example "
            "row (row 3) before uploading your real data."
        ),
    ).alignment = Alignment(wrap_text=True)

    return wb


# ============================================================================
# ROW PARSING & VALIDATION
# ============================================================================
def _cell_str(val: Any) -> str:
    if val is None:
        return ""
    return str(val).strip()


def _cell_bool(val: Any) -> bool:
    if val is None:
        return False
    if isinstance(val, bool):
        return val
    s = str(val).strip().lower()
    return s in {"true", "1", "yes", "y", "✓"}


def _cell_float(val: Any) -> Optional[float]:
    if val is None or val == "":
        return None
    if isinstance(val, (int, float)):
        return float(val)
    try:
        return float(str(val).replace(",", ".").strip())
    except (ValueError, TypeError):
        return None


def _cell_tags(val: Any) -> List[str]:
    if val is None:
        return []
    parts = re.split(r"[;,]", str(val))
    return [p.strip() for p in parts if p and p.strip()]


def _parse_row(row_values: List[Any], headers: List[str]) -> Dict[str, Any]:
    """Map a worksheet row to a dict keyed by column header."""
    out: Dict[str, Any] = {}
    for idx, header in enumerate(headers):
        out[header] = row_values[idx] if idx < len(row_values) else None
    return out


def _normalise_row(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """Validate and normalise. Returns (clean_doc, error_messages)."""
    errors: List[str] = []

    name = _cell_str(raw.get("name"))
    if not name:
        errors.append("name is required")

    brand = _cell_str(raw.get("brand"))
    if not brand:
        errors.append("brand is required")

    category = _cell_str(raw.get("category")).lower() or "catalogue"
    if category not in CATEGORY_VALUES:
        errors.append(f"category '{category}' must be one of {CATEGORY_VALUES}")

    sub_category = _cell_str(raw.get("sub_category")).lower()
    if not sub_category:
        errors.append("sub_category is required")
    elif sub_category not in SUB_CATEGORY_VALUES:
        errors.append(f"sub_category '{sub_category}' must be one of {SUB_CATEGORY_VALUES}")

    product_type_raw = _cell_str(raw.get("product_type")).lower() or None
    product_type: Optional[str] = None
    if product_type_raw:
        if sub_category == "food":
            if product_type_raw in FOOD_TYPE_VALUES:
                product_type = product_type_raw
            else:
                errors.append(
                    f"product_type '{product_type_raw}' for food must be one of {FOOD_TYPE_VALUES}"
                )
        elif sub_category == "hygiene":
            if product_type_raw in HYGIENE_TYPE_VALUES:
                product_type = product_type_raw
            else:
                errors.append(
                    f"product_type '{product_type_raw}' for hygiene must be one of {HYGIENE_TYPE_VALUES}"
                )
        # Silently ignore product_type for other sub_categories (no error, just dropped)

    pet_type = _cell_str(raw.get("pet_type")).lower() or "both"
    if pet_type not in PET_TYPE_VALUES:
        errors.append(f"pet_type '{pet_type}' must be one of {PET_TYPE_VALUES}")

    description = _cell_str(raw.get("description"))
    if not description:
        errors.append("description is required")

    status_val = _cell_str(raw.get("status")).lower() or "published"
    if status_val not in STATUS_VALUES:
        errors.append(f"status '{status_val}' must be one of {STATUS_VALUES}")

    slug_raw = _cell_str(raw.get("slug")) or name
    slug = _slugify(slug_raw)

    doc: Dict[str, Any] = {
        "slug": slug,
        "name": name,
        "name_ka": _cell_str(raw.get("name_ka")) or None,
        "brand": brand,
        "category": category,
        "sub_category": sub_category,
        "product_type": product_type,
        "pet_type": pet_type,
        "size": _cell_str(raw.get("size")) or None,
        "price": _cell_float(raw.get("price")),
        "currency": (_cell_str(raw.get("currency")) or "GEL").upper(),
        "image_url_raw": _cell_str(raw.get("image_url")),
        "description": description,
        "description_ka": _cell_str(raw.get("description_ka")) or None,
        "tags": _cell_tags(raw.get("tags")),
        "featured": _cell_bool(raw.get("featured")),
        "status": status_val,
    }
    return doc, errors


# ============================================================================
# IMAGE HANDLING
# ============================================================================
DEFAULT_PLACEHOLDER = (
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80"
)
ALLOWED_IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
MAX_IMG_BYTES = 8 * 1024 * 1024  # 8 MB


def _public_base_from_request(request: Request) -> str:
    base = (os.environ.get("PUBLIC_BASE_URL") or "").rstrip("/")
    if base:
        return base
    fwd_proto = request.headers.get("x-forwarded-proto")
    fwd_host = request.headers.get("x-forwarded-host")
    if fwd_proto and fwd_host:
        return f"{fwd_proto}://{fwd_host}"
    return str(request.base_url).rstrip("/")


def _download_image(url: str, public_base: str) -> Optional[str]:
    """Download `url` into /uploads and return our hosted URL. Returns None on failure."""
    if not url:
        return None
    try:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return None

        # Determine extension from URL path
        suffix = Path(parsed.path).suffix.lower()
        if suffix not in ALLOWED_IMG_EXT:
            suffix = ".jpg"  # fall back to jpg; many CDNs serve image bytes without extension

        upload_dir = Path(os.environ.get("UPLOAD_DIR", "/app/backend/uploads"))
        upload_dir.mkdir(parents=True, exist_ok=True)

        safe_name = f"{uuid.uuid4().hex}{suffix}"
        dest = upload_dir / safe_name

        resp = requests.get(
            url,
            timeout=15,
            stream=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (compatible; SmartPawImporter/1.0; "
                    "+https://smartpawfood.com)"
                ),
                "Accept": "image/*,*/*;q=0.8",
            },
        )
        if resp.status_code != 200:
            return None
        ctype = (resp.headers.get("Content-Type") or "").lower()
        if "image" not in ctype:
            return None

        size = 0
        with dest.open("wb") as f:
            for chunk in resp.iter_content(chunk_size=64 * 1024):
                if not chunk:
                    continue
                size += len(chunk)
                if size > MAX_IMG_BYTES:
                    f.close()
                    dest.unlink(missing_ok=True)
                    return None
                f.write(chunk)

        if size == 0:
            dest.unlink(missing_ok=True)
            return None

        return f"{public_base}/api/uploads/{safe_name}"
    except (requests.RequestException, OSError):
        return None


# ============================================================================
# ROUTES
# ============================================================================
@import_router.get("/template")
async def download_template(_=Depends(get_current_admin)):
    wb = _build_template_workbook()
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    headers = {
        "Content-Disposition": 'attachment; filename="smartpaw-products-template.xlsx"'
    }
    return StreamingResponse(
        buf,
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        headers=headers,
    )


@import_router.post("")
async def import_products(
    request: Request,
    file: UploadFile = File(...),
    dry_run: bool = False,
    download_images: bool = True,
    _=Depends(get_current_admin),
):
    from server import db

    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(
            status_code=400,
            detail="Please upload an .xlsx file (Excel 2007+). Save your CSV as Excel first.",
        )

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 12 MB).")

    try:
        wb = load_workbook(io.BytesIO(raw_bytes), data_only=True, read_only=True)
    except Exception as exc:  # pragma: no cover - openpyxl error
        raise HTTPException(status_code=400, detail=f"Could not parse Excel file: {exc}")

    if "Products" in wb.sheetnames:
        ws = wb["Products"]
    else:
        ws = wb.worksheets[0]

    rows_iter = ws.iter_rows(values_only=True)
    try:
        header_row = next(rows_iter)
    except StopIteration:
        raise HTTPException(status_code=400, detail="Sheet is empty.")

    headers_raw = [_cell_str(c).lower() for c in header_row]
    missing = [h for h in ("name", "brand", "category", "sub_category", "description") if h not in headers_raw]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}. "
                   "Download the latest template and try again.",
        )

    public_base = _public_base_from_request(request)

    summary = {
        "total_rows": 0,
        "inserted": 0,
        "updated": 0,
        "skipped_empty": 0,
        "failed": 0,
        "errors": [],  # list of {row, slug, errors[]}
        "results": [],  # per-row status
        "dry_run": dry_run,
    }

    row_number = 2  # 1 is header
    for row in rows_iter:
        row_number += 1
        summary["total_rows"] += 1

        # Skip hint/example row if matched (when admins keep it accidentally,
        # we just ignore rows that look like the template hint row by being
        # entirely italic instructions). We don't have formatting in read_only,
        # so we just rely on first non-empty data column being meaningful.
        raw_dict = _parse_row(list(row), headers_raw)
        if not any(_cell_str(v) for v in raw_dict.values()):
            summary["skipped_empty"] += 1
            continue

        doc, errors = _normalise_row(raw_dict)
        if errors:
            summary["failed"] += 1
            summary["errors"].append({
                "row": row_number,
                "slug": doc.get("slug"),
                "name": doc.get("name"),
                "errors": errors,
            })
            continue

        # Image handling
        image_raw = doc.pop("image_url_raw")
        final_image_url: Optional[str] = None
        if image_raw:
            if download_images and image_raw.startswith(("http://", "https://")):
                final_image_url = _download_image(image_raw, public_base)
                if not final_image_url:
                    # Fall back to original URL — better than nothing
                    final_image_url = image_raw
            else:
                final_image_url = image_raw

        existing = await db.products.find_one({"slug": doc["slug"]})
        now_iso = datetime.now(timezone.utc).isoformat()

        if existing:
            update_doc = {**doc, "updated_at": now_iso}
            # Only overwrite image if a new one was supplied
            if final_image_url:
                update_doc["image"] = final_image_url
            elif not existing.get("image"):
                update_doc["image"] = DEFAULT_PLACEHOLDER
            if not dry_run:
                await db.products.update_one({"id": existing["id"]}, {"$set": update_doc})
            summary["updated"] += 1
            summary["results"].append({
                "row": row_number,
                "slug": doc["slug"],
                "action": "updated",
                "image": update_doc.get("image", existing.get("image")),
            })
        else:
            new_doc = {
                **doc,
                "id": str(uuid.uuid4()),
                "image": final_image_url or DEFAULT_PLACEHOLDER,
                "created_at": now_iso,
                "updated_at": now_iso,
            }
            if not dry_run:
                await db.products.insert_one(new_doc)
            summary["inserted"] += 1
            summary["results"].append({
                "row": row_number,
                "slug": doc["slug"],
                "action": "inserted",
                "image": new_doc["image"],
            })

    # Keep response light
    summary["results"] = summary["results"][:200]
    summary["errors"] = summary["errors"][:200]
    return summary
