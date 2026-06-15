"""Reusable LLM enrichment service for SmartPaw products.

Extracted from /app/backend/scripts/import_bewital_catalogue.py so that the
admin "Bulk AI enrich" flow can call the same prompt over any draft product
already in the database — regardless of which partner / spreadsheet brought
the row in.

Single entry point:
    enrich_product_doc(api_key, product_doc) -> dict
        Returns a partial update dict suitable for db.products.update_one
        with $set. Always returns a dict that includes "llm_ok": bool and,
        on failure, "llm_error": str.

Idempotency helper:
    needs_enrichment(product_doc) -> bool
        True when EN+KA description (or name_ka) is missing/short. Used to
        skip already-enriched products unless overwrite=True.
"""

from __future__ import annotations

import json
import re
import uuid
from typing import Any, Dict, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage


ENRICH_SYSTEM = (
    "You write product copy for SmartPaw Food, a Tbilisi-based premium pet food "
    "delivery store. Output ONLY valid minified JSON. No prose, no markdown, no "
    "code fences. Keys must be exactly: name_en, name_ka, description_en, "
    "description_ka, tags, size_label. Descriptions are 90-160 characters, "
    "vivid, benefit-led, factual about life stage / protein / size when known. "
    "name_ka is the EN name transliterated into Georgian when it's a proper "
    "brand line (e.g. 'Belcando Adult Active 12.5 kg' -> 'ბელკანდო Adult Active "
    "12.5 კგ'). description_ka is a native Georgian description (NOT a "
    "machine-translation feel). tags is an array of exactly 5 short, "
    "lowercase, hyphenated English tags."
)


_SLUG_RE = re.compile(r"[^a-z0-9]+")


def _slug(text: str) -> str:
    base = _SLUG_RE.sub("-", (text or "").lower()).strip("-")
    return base or f"p-{uuid.uuid4().hex[:8]}"


def _build_prompt(p: Dict[str, Any]) -> str:
    return (
        "Enrich this pet food product. Respond with the JSON only.\n\n"
        f"Brand: {p.get('brand') or 'unknown'}\n"
        f"Raw name: {p.get('name') or ''}\n"
        f"Pet: {p.get('pet_type') or 'both'}\n"
        f"Category: {p.get('sub_category') or 'food'}"
        f"{' / ' + p['product_type'] if p.get('product_type') else ''}\n"
        f"Pack size (parsed): {p.get('size') or 'unknown'}\n"
        f"Price ({p.get('currency') or 'GEL'}): {p.get('price') if p.get('price') is not None else 'unknown'}\n"
    )


def _safe_json_loads(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    m = re.search(r"\{[\s\S]*\}", cleaned)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def needs_enrichment(product: Dict[str, Any]) -> bool:
    """A draft "needs enrichment" when any of name_ka / description_en /
    description_ka is missing or shorter than 30 chars."""
    name_ka = (product.get("name_ka") or "").strip()
    desc_en = (product.get("description") or "").strip()
    desc_ka = (product.get("description_ka") or "").strip()
    if not name_ka:
        return True
    if len(desc_en) < 30:
        return True
    if len(desc_ka) < 30:
        return True
    return False


async def enrich_product_doc(api_key: str, product: Dict[str, Any]) -> Dict[str, Any]:
    """Call Claude Haiku once and return a $set update dict.

    The returned dict always includes the key ``llm_ok``. On failure it also
    includes ``llm_error`` and a sensible monolingual fallback so callers can
    decide whether to apply the fallback or keep the existing values.
    """
    session_id = f"enrich-{_slug(product.get('name') or 'p')[:48]}"
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=ENRICH_SYSTEM,
        ).with_model("anthropic", "claude-haiku-4-5-20251001")
        resp = await chat.send_message(UserMessage(text=_build_prompt(product)))
        data = _safe_json_loads(resp if isinstance(resp, str) else str(resp))
        if not data:
            raise RuntimeError("LLM response was not valid JSON")

        name_en = (data.get("name_en") or product.get("name") or "").strip()
        name_ka = (data.get("name_ka") or "").strip() or None
        desc_en = (data.get("description_en") or "").strip()
        desc_ka = (data.get("description_ka") or "").strip() or None
        tags = data.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in re.split(r"[,;]", tags) if t.strip()]
        tags = [str(t).strip().lower() for t in tags if str(t).strip()][:6]
        size_label = (data.get("size_label") or product.get("size") or "").strip() or None

        if not desc_en:
            desc_en = (
                f"Premium {product.get('brand') or 'pet food'} formula for your "
                f"{product.get('pet_type') or 'pet'}."
            )

        update: Dict[str, Any] = {
            "name": name_en or product.get("name"),
            "name_ka": name_ka,
            "description": desc_en,
            "description_ka": desc_ka,
            "tags": tags,
            "llm_ok": True,
        }
        if size_label:
            update["size"] = size_label
        return update
    except Exception as exc:  # noqa: BLE001
        return {
            "llm_ok": False,
            "llm_error": str(exc)[:200],
        }
