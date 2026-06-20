"""SmartPaw Admin — AI Quick-add product extraction.

Two endpoints, both admin-only:

  POST /api/admin/products/quick-extract-url
       Body: { "url": "https://partner.com/product-page" }
       Returns: { "name": ..., "brand": ..., "image_url": ..., ... }

  POST /api/admin/products/quick-extract-image
       Multipart upload (file) OR JSON { "image_base64": "...", "mime_type": "image/jpeg" }
       Returns: same shape as URL extractor.

Both use Gemini via the Emergent LLM key. No data is stored — the response is
fed back into the existing admin product-form prefilled.
"""
from __future__ import annotations

import base64
import json
import logging
import os
import re
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from auth import get_current_admin

logger = logging.getLogger("smartpaw.quick_add")

quick_add_router = APIRouter(prefix="/api/admin/products", tags=["admin-quick-add"])

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
EXTRACTION_PROMPT = """You are a product-data extraction assistant for a Georgian pet-supplies retailer (SmartPaw).
Look at the product page / photo and extract the following fields as STRICT JSON.

Required fields:
  name        : English product name, max 100 chars (e.g. "Maxi Adult 5+ Dry Food")
  brand       : Brand name (e.g. "Royal Canin", "Hill's Science Diet")
  category    : one of "food", "hygiene", "vitamins" — best guess
  sub_category: see allowed values per category below; null if unsure
  pet_type    : "dog" | "cat" | "both" — best guess
  size        : Size or weight WITH unit (e.g. "15kg", "400g", "1.5L"); empty string if unknown
  price       : Numeric retail price as a float in the page currency; null if not visible
  currency    : 3-letter code (e.g. "GEL", "USD", "EUR"); null if unknown
  image_url   : Direct URL of the main product image; null if not extractable
  description : 2-3 sentences in English describing the product; empty string if unknown
  name_ka     : Georgian translation of the name; empty string if you cannot translate confidently
  description_ka : Georgian translation of the description; empty string if you cannot

Allowed sub_category values:
  food     -> "dry-food", "wet-food", "snacks", "other"
  hygiene  -> "grooming", "veterinary-line", "specific-care", "other"
  vitamins -> ""   (vitamins has no sub-categories — return empty string)

Output rules:
- Return ONLY the JSON object. No preamble. No code fences.
- Use null for unknown numeric/url fields.
- Use "" for unknown string fields.
- Never invent data — leave fields empty if you cannot confirm them.
"""


def _build_chat(session_id: str):
    from emergentintegrations.llm.chat import LlmChat
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    return LlmChat(
        api_key=key,
        session_id=session_id,
        system_message=EXTRACTION_PROMPT,
    ).with_model("gemini", "gemini-2.5-flash")


def _parse_json_response(raw: str) -> dict:
    """Strip any code-fence noise and parse JSON."""
    text = raw.strip()
    # Remove ```json fences if Gemini wrapped it anyway
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to locate a JSON object inside the response
        m = re.search(r"\{.*\}", text, re.S)
        if not m:
            raise HTTPException(502, "AI did not return parseable JSON")
        try:
            return json.loads(m.group(0))
        except Exception as e:  # noqa: BLE001
            raise HTTPException(502, f"AI JSON parse error: {e}")


async def _send_for_extraction(chat, user_message) -> dict:
    """Run the chat and collect the full response (we don't need streaming here)."""
    from emergentintegrations.llm.chat import TextDelta, StreamDone
    chunks = []
    async for ev in chat.stream_message(user_message):
        if isinstance(ev, TextDelta):
            chunks.append(ev.content)
        elif isinstance(ev, StreamDone):
            break
    raw = "".join(chunks).strip()
    if not raw:
        raise HTTPException(502, "AI returned empty response")
    return _parse_json_response(raw)


# ---------------------------------------------------------------------------
# URL extraction
# ---------------------------------------------------------------------------
class UrlExtractRequest(BaseModel):
    url: str = Field(min_length=10)


# Modern Chrome User-Agent + standard headers — covers ~30% of bot-protected
# sites that just sniff the UA string.
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.9,ka;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Ch-Ua": '"Chromium";v="126", "Not_A Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Linux"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
}


async def _fetch_with_httpx(url: str) -> Optional[str]:
    """Plain HTTP fetch with browser-like headers. Returns HTML or None on failure."""
    try:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers=BROWSER_HEADERS,
        ) as c:
            r = await c.get(url)
            if r.status_code in (401, 403, 429):
                logger.info("httpx blocked by %d → fallback to Playwright", r.status_code)
                return None
            if r.status_code >= 400:
                raise HTTPException(400, f"Partner page returned {r.status_code}")
            html = r.text
            # If the HTML is tiny (likely a JS-shell), also try Playwright
            if len(html) < 1500:
                logger.info("httpx HTML too small (%d chars) → fallback to Playwright", len(html))
                return None
            return html
    except httpx.RequestError as e:
        logger.info("httpx error %s → fallback to Playwright", e)
        return None


async def _fetch_with_playwright(url: str) -> Optional[str]:
    """Headless Chromium fetch — handles JS-rendered pages and most bot blockers."""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        return None
    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            try:
                ctx = await browser.new_context(
                    user_agent=BROWSER_HEADERS["User-Agent"],
                    locale="en-US",
                    viewport={"width": 1280, "height": 800},
                )
                page = await ctx.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                # Give JS a moment to populate the DOM
                try:
                    await page.wait_for_load_state("networkidle", timeout=5000)
                except Exception:  # noqa: BLE001
                    pass
                html = await page.content()
                return html
            finally:
                await browser.close()
    except Exception as e:  # noqa: BLE001
        logger.warning("Playwright fetch failed: %s", e)
        return None


@quick_add_router.post("/quick-extract-url")
async def quick_extract_from_url(body: UrlExtractRequest, _=Depends(get_current_admin)):
    from emergentintegrations.llm.chat import UserMessage

    url = body.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # Strategy: try fast httpx first, fall back to Playwright (real browser).
    html = await _fetch_with_httpx(url)
    if html is None:
        html = await _fetch_with_playwright(url)
    if html is None:
        raise HTTPException(
            status_code=422,
            detail=(
                "This partner site is blocking automated fetching. "
                "Please switch to the 'From photo' tab and upload a screenshot "
                "or product photo instead — that always works."
            ),
        )

    # Trim very large pages — we only need the meaningful content
    if len(html) > 100_000:
        html = html[:100_000]

    chat = _build_chat(session_id=f"qa-url-{url[:32]}")
    user_msg = UserMessage(
        text=(
            f"Extract product data from this page (URL: {url}). "
            f"The image_url field MUST be an absolute URL — if the page uses a relative path, "
            f"resolve it against the URL above.\n\nHTML follows:\n\n{html}"
        )
    )
    data = await _send_for_extraction(chat, user_msg)
    data["_source_url"] = url
    return data


# ---------------------------------------------------------------------------
# Image extraction
# ---------------------------------------------------------------------------
class ImageExtractRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"


@quick_add_router.post("/quick-extract-image")
async def quick_extract_from_image_b64(body: ImageExtractRequest, _=Depends(get_current_admin)):
    from emergentintegrations.llm.chat import UserMessage, ImageContent
    image_b64 = body.image_base64
    if image_b64.startswith("data:"):
        # Strip data-URL prefix
        image_b64 = image_b64.split(",", 1)[-1]
    try:
        base64.b64decode(image_b64, validate=False)
    except Exception:
        raise HTTPException(400, "Invalid base64 image")

    chat = _build_chat(session_id="qa-image-b64")
    user_msg = UserMessage(
        text="Extract product data from this product photo.",
        file_contents=[ImageContent(image_base64=image_b64)],
    )
    return await _send_for_extraction(chat, user_msg)


@quick_add_router.post("/quick-extract-image-upload")
async def quick_extract_from_image_upload(
    file: UploadFile = File(...),
    _=Depends(get_current_admin),
):
    from emergentintegrations.llm.chat import UserMessage, ImageContent
    raw = await file.read()
    if len(raw) > 8 * 1024 * 1024:
        raise HTTPException(413, "Image too large (>8MB)")
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(415, f"Unsupported image type: {file.content_type}")
    b64 = base64.b64encode(raw).decode("ascii")
    chat = _build_chat(session_id=f"qa-image-{file.filename}")
    user_msg = UserMessage(
        text="Extract product data from this product photo.",
        file_contents=[ImageContent(image_base64=b64)],
    )
    return await _send_for_extraction(chat, user_msg)
