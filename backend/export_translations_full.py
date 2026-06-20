"""Export ALL SmartPaw side-by-side English / Georgian UI strings to one XLSX
for human review and editing.

Generates a single workbook with separate sheets so each context is easy to
locate, with columns for proposed edits.

Sheets:
  1. Marketing — UI strings
  2. Cabinet  — UI strings
  3. Page copy — inline { en: "...", ka: "..." } found in JSX/JS pages
  4. Inline strings — lang === 'ka' ? 'X' : 'Y' patterns
  5. Legal — legalContent (privacy, terms, refund, delivery)
  6. Backend templates — strings inside HTML email / notification snippets
  7. Notes — how to use this file

Columns: Source · Key · English (current) · Georgian (current) ·
         New English · New Georgian · Notes

Run:
    python /app/backend/export_translations_full.py
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
FRONT_SRC = ROOT / "frontend" / "src"
OUT_DIR = ROOT / "backend" / "uploads" / "public"
OUT_FILE = OUT_DIR / "smartpaw_translations.xlsx"

HEADER_FILL = PatternFill("solid", fgColor="0A4D8C")
ACCENT_FILL = PatternFill("solid", fgColor="F25C05")
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
TOP_ALIGN = Alignment(wrap_text=True, vertical="top")
BORDER = Border(
    left=Side(style="thin", color="DDDDDD"),
    right=Side(style="thin", color="DDDDDD"),
    top=Side(style="thin", color="DDDDDD"),
    bottom=Side(style="thin", color="DDDDDD"),
)
COLUMNS = ["Source", "Key", "English (current)", "Georgian (current)",
           "New English", "New Georgian", "Notes"]
COL_WIDTHS = [22, 50, 60, 60, 60, 60, 30]


# ---------------------------------------------------------------------------
# JS-object loader (Node + fallback regex parser)
# ---------------------------------------------------------------------------
NODE_SCRIPT = r"""
import fs from 'node:fs';
import url from 'node:url';
const file = process.argv[2];
const varName = process.argv[3];
const tmp = file.replace(/\.js$/, '.__i18n_tmp__.mjs');
fs.copyFileSync(file, tmp);
try {
  const mod = await import(url.pathToFileURL(tmp).href);
  const data = mod[varName] || mod.default || mod;
  process.stdout.write(JSON.stringify(data));
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  try { fs.unlinkSync(tmp); } catch (_) {}
}
"""


def _load_with_node(js_file: Path, var_name: str) -> dict:
    script_path = OUT_DIR / "_load_i18n.mjs"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    script_path.write_text(NODE_SCRIPT, encoding="utf-8")
    try:
        result = subprocess.run(
            ["node", str(script_path), str(js_file), var_name],
            check=True, capture_output=True, text=True,
        )
    finally:
        try:
            script_path.unlink()
        except OSError:
            pass
    return json.loads(result.stdout)


def _load_with_regex(js_file: Path, var_name: str) -> dict:
    src = js_file.read_text(encoding="utf-8")
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"//.*", "", src)
    match = re.search(rf"const\s+{var_name}\s*=\s*(\{{)", src)
    if not match:
        raise RuntimeError(f"Could not find `const {var_name} =` in {js_file}")
    start = match.start(1)
    depth = 0
    end = None
    in_str = None
    escape = False
    for i, ch in enumerate(src[start:], start=start):
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            continue
        if ch in ("'", '"', "`"):
            in_str = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end is None:
        raise RuntimeError(f"Unbalanced braces while parsing {js_file}")
    obj_src = src[start:end]
    obj_src = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', obj_src)
    obj_src = obj_src.replace("'", '"')
    obj_src = re.sub(r",(\s*[}\]])", r"\1", obj_src)
    return json.loads(obj_src)


def load_js_dict(js_file: Path, var_name: str) -> dict:
    try:
        return _load_with_node(js_file, var_name)
    except Exception:
        return _load_with_regex(js_file, var_name)


def flatten(prefix: str, value, out: list[tuple[str, str]]) -> None:
    if isinstance(value, dict):
        for k, v in value.items():
            key = f"{prefix}.{k}" if prefix else k
            flatten(key, v, out)
    elif isinstance(value, list):
        for idx, v in enumerate(value):
            flatten(f"{prefix}[{idx}]", v, out)
    elif value is None:
        out.append((prefix, ""))
    else:
        out.append((prefix, str(value)))


# ---------------------------------------------------------------------------
# Inline-pattern scanners
# ---------------------------------------------------------------------------
# Matches: name: { en: "...", ka: "..." } using DOUBLE quotes (most common)
COPY_PATTERN_DQ = re.compile(
    r'(?P<name>[A-Za-z_][A-Za-z0-9_]*)\s*:\s*\{\s*en\s*:\s*"(?P<en>(?:\\.|[^"\\])*?)"\s*,\s*ka\s*:\s*"(?P<ka>(?:\\.|[^"\\])*?)"\s*\}',
    re.DOTALL,
)
# Matches: name: { en: '...', ka: '...' } using SINGLE quotes
COPY_PATTERN_SQ = re.compile(
    r"(?P<name>[A-Za-z_][A-Za-z0-9_]*)\s*:\s*\{\s*en\s*:\s*'(?P<en>(?:\\.|[^'\\])*?)'\s*,\s*ka\s*:\s*'(?P<ka>(?:\\.|[^'\\])*?)'\s*\}",
    re.DOTALL,
)

# Matches: lang === 'ka' ? "X" : "Y"  (KA-first ternary, double-quoted strings)
TERNARY_KA_DQ = re.compile(
    r'lang\s*===?\s*[\'"]ka[\'"]\s*\?\s*"(?P<ka>(?:\\.|[^"\\])*?)"\s*:\s*"(?P<en>(?:\\.|[^"\\])*?)"',
    re.DOTALL,
)
TERNARY_KA_SQ = re.compile(
    r"lang\s*===?\s*['\"]ka['\"]\s*\?\s*'(?P<ka>(?:\\.|[^'\\])*?)'\s*:\s*'(?P<en>(?:\\.|[^'\\])*?)'",
    re.DOTALL,
)
TERNARY_EN_DQ = re.compile(
    r'lang\s*===?\s*[\'"]en[\'"]\s*\?\s*"(?P<en>(?:\\.|[^"\\])*?)"\s*:\s*"(?P<ka>(?:\\.|[^"\\])*?)"',
    re.DOTALL,
)
TERNARY_EN_SQ = re.compile(
    r"lang\s*===?\s*['\"]en['\"]\s*\?\s*'(?P<en>(?:\\.|[^'\\])*?)'\s*:\s*'(?P<ka>(?:\\.|[^'\\])*?)'",
    re.DOTALL,
)


def scan_jsx_for_copy(root: Path):
    """Yield (rel_path, name, en, ka) for every inline {en,ka} pair."""
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in (".js", ".jsx"):
            continue
        if "node_modules" in path.parts or path.name.endswith(".test.js"):
            continue
        if path.is_relative_to(root / "lib" / "i18n") or path.is_relative_to(root / "cabinet" / "i18n"):
            continue
        if path == root / "lib" / "i18n.js":
            continue
        # Legal content is extracted separately in the "Legal" sheet
        if path == root / "data" / "legalContent.js":
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        seen_in_file = set()
        for pat in (COPY_PATTERN_DQ, COPY_PATTERN_SQ):
            for m in pat.finditer(text):
                key = (m.group("name"), m.group("en"))
                if key in seen_in_file:
                    continue
                seen_in_file.add(key)
                yield path.relative_to(root), m.group("name"), _unescape(m.group("en")), _unescape(m.group("ka"))


def scan_jsx_for_ternaries(root: Path):
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in (".js", ".jsx"):
            continue
        if "node_modules" in path.parts:
            continue
        if path.is_relative_to(root / "lib" / "i18n") or path.is_relative_to(root / "cabinet" / "i18n"):
            continue
        if path == root / "lib" / "i18n.js":
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for pat in (TERNARY_KA_DQ, TERNARY_KA_SQ, TERNARY_EN_DQ, TERNARY_EN_SQ):
            for m in pat.finditer(text):
                en = _unescape(m.group("en"))
                ka = _unescape(m.group("ka"))
                # Skip code-identifier ternaries like `lang === 'ka' ? 'ka' : 'en'`
                # used for HTTP headers / Locale strings.
                if en in ("en", "ka", "en-GB", "en-US", "ka-GE") and ka in ("en", "ka", "en-GB", "en-US", "ka-GE"):
                    continue
                # Skip empty strings
                if not en.strip() and not ka.strip():
                    continue
                yield path.relative_to(root), en, ka


def _unescape(s: str) -> str:
    return s.replace('\\"', '"').replace("\\'", "'").replace("\\n", "\n").replace("\\\\", "\\")


# ---------------------------------------------------------------------------
# Sheet writers
# ---------------------------------------------------------------------------
def style_header(ws, ncols):
    for col_idx in range(1, ncols + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(vertical="center")
    ws.freeze_panes = "A2"


def write_section_sheet(ws, rows, label: str):
    ws.append(COLUMNS)
    style_header(ws, len(COLUMNS))
    for source, key, en, ka, notes in rows:
        ws.append([source, key, en, ka, "", "", notes])
    for i, w in enumerate(COL_WIDTHS, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = TOP_ALIGN
            cell.border = BORDER
    ws.row_dimensions[1].height = 28


def build_marketing_rows() -> list:
    en = load_js_dict(FRONT_SRC / "lib" / "i18n" / "en.js", "en")
    ka = load_js_dict(FRONT_SRC / "lib" / "i18n" / "ka.js", "ka")
    en_flat, ka_flat = [], []
    flatten("", en, en_flat)
    flatten("", ka, ka_flat)
    ka_map = dict(ka_flat)
    out = []
    for key, en_val in en_flat:
        out.append(("Marketing UI", key, en_val, ka_map.get(key, ""), ""))
    extra = [k for k, _ in ka_flat if k not in dict(en_flat)]
    for key in extra:
        out.append(("Marketing UI", key, "", dict(ka_flat)[key], "KA-only key"))
    return out


def build_cabinet_rows() -> list:
    en = load_js_dict(FRONT_SRC / "cabinet" / "i18n" / "en.js", "en")
    ka = load_js_dict(FRONT_SRC / "cabinet" / "i18n" / "ka.js", "ka")
    en_flat, ka_flat = [], []
    flatten("", en, en_flat)
    flatten("", ka, ka_flat)
    ka_map = dict(ka_flat)
    out = []
    for key, en_val in en_flat:
        out.append(("Cabinet UI", key, en_val, ka_map.get(key, ""), ""))
    extra = [k for k, _ in ka_flat if k not in dict(en_flat)]
    for key in extra:
        out.append(("Cabinet UI", key, "", dict(ka_flat)[key], "KA-only key"))
    return out


def build_page_copy_rows() -> list:
    rows = []
    for rel, name, en, ka in scan_jsx_for_copy(FRONT_SRC):
        rows.append((f"Page · {rel}", name, en, ka, ""))
    return rows


def build_inline_rows() -> list:
    rows = []
    seen = set()
    for rel, en, ka in scan_jsx_for_ternaries(FRONT_SRC):
        sig = (str(rel), en, ka)
        if sig in seen:
            continue
        seen.add(sig)
        rows.append((f"Inline · {rel}", "(ternary)", en, ka, ""))
    return rows


def build_legal_rows() -> list:
    """Parse data/legalContent.js exports.

    The file structure is a JS object with deeply nested { en, ka } leaves
    (titles, sections, paragraphs). We hand off to the JS dict loader.
    """
    legal_file = FRONT_SRC / "data" / "legalContent.js"
    if not legal_file.exists():
        return []
    try:
        legal = load_js_dict(legal_file, "legalContent")
    except Exception:
        return []
    rows = []
    def walk(prefix, node):
        if isinstance(node, dict):
            if set(node.keys()) >= {"en", "ka"} and not any(isinstance(v, (dict, list)) for v in node.values()):
                rows.append(("Legal", prefix, str(node.get("en", "")), str(node.get("ka", "")), ""))
                return
            for k, v in node.items():
                walk(f"{prefix}.{k}" if prefix else k, v)
        elif isinstance(node, list):
            for idx, v in enumerate(node):
                walk(f"{prefix}[{idx}]", v)
    walk("", legal)
    return rows


def build_backend_rows() -> list:
    """User-facing backend HTML/text snippets that may need bilingual copy."""
    rows = []
    candidates = [
        (
            ROOT / "backend" / "cabinet_routes.py",
            "_notify_admin_new_user — Resend HTML",
            "New SmartPaw cabinet registration / A new customer just signed up.",
            "(not yet localised)",
            "Admin-only Resend email; not user-facing. Translate only if needed."
        ),
    ]
    for path, name, en, ka, note in candidates:
        if path.exists():
            rows.append((f"Backend · {path.name}", name, en, ka, note))
    return rows


def build_notes_rows() -> list:
    return [
        ("How to use", "1", "This file contains every English/Georgian string in the SmartPaw website and customer cabinet, grouped into sheets by context.", "ეს ფაილი შეიცავს SmartPaw-ის ვებსაიტისა და კაბინეტის ყველა ინგლისურ/ქართულ ტექსტს, კონტექსტის მიხედვით დაყოფილ ფურცლებად.", ""),
        ("How to use", "2", "To propose a change, fill in the 'New English' or 'New Georgian' column. Leave the old columns alone — the developer will see your edits side-by-side.", "ცვლილების შესაცვლელად შეავსე „ახალი ინგლისური“ ან „ახალი ქართული“ სვეტი. ძველი სვეტი არ შეცვალო — დეველოპერი ხედავს ცვლილებებს გვერდიგვერდ.", ""),
        ("How to use", "3", "You don't have to edit every row. Empty 'New…' cells = keep current text.", "არ არის აუცილებელი ყველა მწკრივის რედაქტირება. ცარიელი „ახალი…“ უჯრა = დატოვე არსებული.", ""),
        ("How to use", "4", "The 'Source' column tells the developer where the string lives in the codebase. The 'Key' is the programmatic identifier (do NOT translate keys).", "„წყარო“ სვეტი დეველოპერს უჩვენებს სად ცხოვრობს ტექსტი კოდში. „გასაღები“ არის პროგრამული იდენტიფიკატორი (ნუ თარგმნი გასაღებებს).", ""),
        ("How to use", "5", "Send the edited file back as a reply attachment, or paste a list of changes — whichever is easier for you.", "გასწორებული ფაილი დააბრუნე პასუხის დანართად ან ჩაწერე ცვლილებების სია — როგორც გირჩევნია.", ""),
        ("Tip", "Brand names", "Do not translate 'SmartPaw', product brand names (Bewital, Monge, etc.), or unit labels like 'GEL', 'kg', 'mins'.", "ნუ თარგმნი 'SmartPaw'-ს, პროდუქტის ბრენდის სახელებს (Bewital, Monge და ა.შ.), ან ერთეულებს — 'GEL', 'kg', 'mins'.", ""),
        ("Tip", "Tone", "Marketing-site copy is warm, confident, slightly playful. Cabinet copy is direct and helpful — please mirror that tone.", "მარკეტინგ საიტის ტონი — თბილი, თავდაჯერებული, ცოტა ხალისიანი. კაბინეტის ტონი — პირდაპირი და დამხმარე. გთხოვ შეესაბამოს.", ""),
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def write_workbook(out_path: Path):
    wb = Workbook()

    # Sheet 1: Notes (first, so the user lands on it)
    ws_notes = wb.active
    ws_notes.title = "How to use"
    ws_notes.append(["Category", "Item", "English", "ქართული", "Your reply", "(unused)", "Notes"])
    style_header(ws_notes, 7)
    for cat, item, en, ka, note in build_notes_rows():
        ws_notes.append([cat, item, en, ka, "", "", note])
    for i, w in enumerate([18, 16, 60, 60, 40, 4, 30], start=1):
        ws_notes.column_dimensions[get_column_letter(i)].width = w
    for row in ws_notes.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = TOP_ALIGN
            cell.border = BORDER

    # Sheet 2: Marketing
    ws = wb.create_sheet("Marketing UI")
    rows = build_marketing_rows()
    write_section_sheet(ws, rows, "Marketing UI")
    print(f"  Marketing UI: {len(rows)} rows")

    # Sheet 3: Cabinet
    ws = wb.create_sheet("Cabinet UI")
    rows = build_cabinet_rows()
    write_section_sheet(ws, rows, "Cabinet UI")
    print(f"  Cabinet UI: {len(rows)} rows")

    # Sheet 4: Page copy
    ws = wb.create_sheet("Page copy")
    rows = build_page_copy_rows()
    write_section_sheet(ws, rows, "Page copy")
    print(f"  Page copy: {len(rows)} rows")

    # Sheet 5: Inline ternaries
    ws = wb.create_sheet("Inline strings")
    rows = build_inline_rows()
    write_section_sheet(ws, rows, "Inline strings")
    print(f"  Inline strings: {len(rows)} rows")

    # Sheet 6: Legal
    ws = wb.create_sheet("Legal")
    rows = build_legal_rows()
    write_section_sheet(ws, rows, "Legal")
    print(f"  Legal: {len(rows)} rows")

    # Sheet 7: Backend
    ws = wb.create_sheet("Backend")
    rows = build_backend_rows()
    write_section_sheet(ws, rows, "Backend")
    print(f"  Backend: {len(rows)} rows")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out_path)


def main():
    print(f"Writing {OUT_FILE}…")
    write_workbook(OUT_FILE)
    print(f"Done. File at: {OUT_FILE}")
    print(f"Size: {OUT_FILE.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
