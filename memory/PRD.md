# SmartPaw Food — PRD

## Original problem statement
SmartPaw Food is a Tbilisi-based delivery service for cat and dog food. The web property is a marketing + e-commerce-lite site (no checkout yet — WhatsApp-driven leads) that lets pet parents:
- Browse a curated product catalogue (mixed brands sourced from local partners like Bewital).
- See bilingual content — **English (primary)** and **ქართული (Georgian, KA)**.
- Read content/blog/promos and submit a contact lead via WhatsApp.

The product must feel modern and distinctive — primary palette: **Orange (#F25C05)** + **Blue (#0A4D8C)** with a warm ivory paper background (#FBF7EE).

An **Admin Control Panel** at `/admin/*` lets the team manage products, special offers, plans, blog posts, leads and contact inquiries.

## Tech stack
- Frontend: React (CRA), Tailwind, Shadcn UI, custom i18n (en/ka), Lucide icons.
- Backend: FastAPI, Motor (MongoDB), Pydantic v2, BCrypt + JWT for admin auth.
- AI: `emergentintegrations` (Emergent LLM key — GPT-4o / Claude Haiku 4.5) for bilingual content enrichment of imported partner catalogues.
- Excel ingestion: pandas + openpyxl.

## Personas
1. **Pet parent (visitor)** — browses catalogue, picks plan, submits WhatsApp lead.
2. **Admin / merchandiser** — logs in to /admin, manages catalogue, imports partner price-lists, exports leads to CSV.

## Core requirements (current scope)
- Public storefront with bilingual content and only `status=published` products.
- Admin CRUD for products, special offers, plans, blog posts.
- Read-only admin views for leads and contact inquiries with CSV export + WhatsApp deep links.
- **Bulk import pipeline**:
  - Generic template-based importer (any branded .xlsx).
  - One-click **Bewital partner catalogue** AI-enriched importer that auto-generates EN+KA names/descriptions/tags via the Emergent LLM and inserts as drafts in GEL.
- All admin endpoints behind JWT (HS256, 8h) + brute-force lockout (5 failed attempts/IP+email/15 min).

---

## CHANGELOG (most recent first)

### 2026-02 — Domain Migration to `smartpaw.ge` (P0 complete)
- Site went live on the custom domain `smartpaw.ge`.
- Canonical URL flipped from `smartpawfood.ge` → `smartpaw.ge` across: `backend/server.py` (`SITE_URL` default, drives `/api/sitemap.xml` + structured data), `public/index.html` (canonical, og:url, og:image, twitter:image, keywords), `public/robots.txt` (sitemap pointer), `src/lib/siteConfig.js`.
- Default language switched to **Georgian (ka)** for first-time visitors — `LangContext` default + `<html lang="ka">` + `og:locale=ka_GE` (en_GE as alternate). Returning visitors keep their stored preference.
- Verified `/api/sitemap.xml` now serves `https://smartpaw.ge/...` entries.

### 2026-02 — Pre-launch Polish Batch (P0 complete — launch-ready)
- SEO: dynamic `/api/sitemap.xml` (static routes + published products + blog posts), `public/robots.txt`, full OG/Twitter/JSON-LD meta in `public/index.html`. Sitemap paths reconciled with real SPA routes (`/catalogue/*`, `/delivery-policy`, `/refund-policy`).
- Analytics scaffolding: GA4 + Plausible gated by `REACT_APP_GA4_ID` / `REACT_APP_PLAUSIBLE_DOMAIN` env vars (no-op until populated).
- Favicon: `public/favicon.svg` with SmartPaw orange paw.
- Bilingual Legal Pages: full EN+KA Privacy, Terms, Delivery, Refund Policy in `src/data/legalContent.js` (~525 lines), rendered by refactored `src/pages/LegalPages.jsx` (`LegalDocument` component, `useLang()` + `pickLocale`, `**bold**` parser, ordered/unordered lists, mandatory `legal-entity-block` footer with Cleanpaw International LLC info). Lead testid wrapper always present regardless of `doc.lead` presence.
- Centralised site constants in `src/lib/siteConfig.js` (WhatsApp URL, brand details) — consumed by `WhatsAppFab`, `FAQPage`, `PageShell`.
- Smoke test via testing_agent_v3_fork → backend 18/18 green, frontend ~100% after legal-page fixes.

### 2026-02 — Phase A7 AI Catalog Enrichment Pipeline + Bulk Actions (P1 complete)
- Backend: new shared service `/app/backend/services/llm_enrichment.py` (enrich_product_doc + needs_enrichment heuristic — EN-desc≥30 chars + name_ka + description_ka≥30 chars).
- Backend: in-memory job tracker `/app/backend/services/job_store.py` driving async polling.
- Backend: `POST /api/admin/products/enrich-bulk` (returns `{job_id,total,skipped_already_enriched}`) + `GET /api/admin/jobs/{job_id}` polling. asyncio.Semaphore(3) to respect LLM budget.
- Backend: `GET /api/admin/products` now accepts `needs_enrichment=true`. `GET /api/admin/products/summary` returns `status_counts` + `needs_enrichment` count + `by_brand` list — counts agree exactly with the filtered list (verified at 187 == 187 on live catalogue).
- Backend: bulk action endpoints `POST /api/admin/products/bulk-publish`, `/bulk-unpublish`, `/bulk-delete`.
- Frontend: `AdminProducts.jsx` rewritten with 4 status tabs (All / Needs AI enrichment / Drafts / Published), brand filter from summary, per-row checkbox, sticky bulk action bar (Enrich/Publish/Unpublish/Delete + overwrite toggle), JobProgressCard with 1.5s polling that auto-refreshes counts when the job lands.
- Frontend: `adminApi.js` wrappers — `enrichBulk`, `getJob`, `productsSummary`, `bulkPublish`, `bulkUnpublish`, `bulkDelete`.
- Verified end-to-end by `testing_agent_v3_fork` iteration_14 → backend 10/10 pytest, frontend all flows green. Live run: needs_enrichment count moved 187 → 182, ~3 LLM calls total. Idempotency (overwrite=false) skips 100% of already-enriched rows; overwrite=true regenerates content.
- Cosmetic fix: brand-filter `<option>` label collapsed to single template string to silence the dev-overlay "<span> cannot be a child of <option>" hydration warning.

### 2026-02 — Strip legacy competitor-catalogue boilerplate (P1 complete)
- New script `/app/backend/scripts/strip_boilerplate.py` — regex-cleans the `"— sold by X. Pre-filled from competitor catalogue; please rewrite this description in your own words…"` boilerplate from product `description` / `description_*` / `short_description_*` fields.
- Ran once: 189 published products inspected, **189 cleaned** in-place. Descriptions now contain only the product name (e.g. `"TAURO MIXING BOTTLE 1000 ml (BUTEL131)"`) — no more embarrassing "please rewrite" text on the storefront.
- Idempotent — safe to re-run.

### 2026-02 — Home page category cards regression fix (P0 complete)
- Root cause: `/app/frontend/src/lib/i18n.js` (the real i18n source, not the unused `i18n/` folder) had KA `products.regular.items` and `products.specials.items` using Georgian strings for the `key` field (e.g. `"key": "საკვები"`). Image lookup in `ProductSections.jsx` is keyed on canonical English ids (`food`, `hygiene`, …) so KA cards rendered with no image and broken data-testids.
- Restored canonical keys in KA: `food / hygiene / vitamins` and `toys / tech / services`.
- `ProductSection.jsx` — replaced `<button onClick={onOpenSignup}>` with `<Link to={routes[it.key]}>` so cards navigate to `/catalogue/<id>` and `/special-offers/<id>` instead of opening the signup modal.
- `ProductSections.jsx` — added per-section route maps (`REGULAR_ROUTES`, `SPECIAL_ROUTES`) and dropped the now-unused `onOpenSignup` prop.
- Smoke-tested via screenshot tool: all 6 cards show images in KA, clicking the food card lands on `/catalogue/food`.

### 2026-02 — Bewital one-click import (P0 complete)
- Added `POST /api/admin/products/import/bewital` (admin-only).
- New script `/app/backend/scripts/import_bewital_catalogue.py` parses `bewital_pricelist.xlsx`, enriches each row with EN+KA bilingual fields via Emergent LLM, and upserts as `status="draft"` in GEL.
- Ran natively → **166 Bewital drafts** seeded across brands (Belcando 94, Leonardo 47, Bewi Dog 9, 4 Dogs 8, R-Line 4, Bewi Cat 2, Bewital 2) and pet types (dog 117, cat 49).
- Added UI section to `/admin/products/import` with "Preview (dry run)" + "Run Bewital import" buttons + bilingual result panel.
- **dry_run optimization** — when `dry_run=True` we now skip LLM enrichment entirely and return parsed-row counts + brand/pet breakdown in ~1.5s. Avoids Cloudflare 100s timeout that was returning 502 in the UI.
- Full admin regression run via `testing_agent_v3_fork` (iteration_13) — 21/21 backend pytest pass, 12/13 frontend flows pass (the one frontend miss was the dry-run timeout, now fixed and verified via screenshot).

### Earlier milestones
- Admin Control Panel scaffolding + JWT auth + brute-force lockout.
- Bilingual i18n (en/ka) across storefront with `useLang()` and translation files.
- Storefront catalogue with brand/pet/category filters, SEO meta, leads via WhatsApp deep link.
- Generic template-based xlsx product importer with image-URL→CDN download.
- Special Offers / Plans / Blog CRUD.
- Leads admin with green WhatsApp button per row + CSV export.

---

## Roadmap

### P0 — done ✅
- Bewital AI-enriched one-click import + UI section + dry-run optimization.
- Phase A7 AI Catalog Enrichment Pipeline + Bulk Actions (`/enrich-bulk` async job + draft-review tabs in /admin/products).

### P1 — next
- **Background-job pattern for live Bewital import**: convert the *live* Bewital import (`dry_run=False`) to use the same `/api/admin/jobs/{id}` pattern as `/enrich-bulk` so the operator gets immediate feedback instead of waiting on a single long HTTP request.

### P2 — soon
- Stabilise brute-force lockout identifier (email-only fallback when X-Forwarded-For rotates).
- Refactor `admin_routes.py` (813 lines) into per-resource files: `routes/admin/products.py`, `routes/admin/special_offers.py`, `routes/admin/plans.py`, `routes/admin/blog.py`, `routes/admin/uploads.py`, `routes/admin/leads.py`.
- Decouple LLM enrichment from persistence in `import_bewital_catalogue.py` (separate `parse_only` / `enrich_only` / `persist_only` phases).

### P3 — backlog
- SEO social unfurling — generate dynamic OG image cards for products / blog posts.
- Add Instagram / Facebook / TikTok icons inside the mobile hamburger drawer (visible <1536px).
- More partner catalogues following the Bewital pattern (Monge already scaffolded under `scripts/build_monge_catalogue.py`).

---

## Key files
- Backend: `/app/backend/server.py`, `/app/backend/admin_routes.py`, `/app/backend/scripts/import_bewital_catalogue.py`
- Frontend admin: `/app/frontend/src/pages/admin/AdminProductsImport.jsx`, `/app/frontend/src/lib/adminApi.js`
- Tests: `/app/backend/tests/test_admin_regression_iter13.py`, `/app/test_reports/iteration_13.json`
- Memory: `/app/memory/PRD.md`, `/app/memory/test_credentials.md`

## Key API endpoints
- `POST /api/admin/login` → JWT (HS256, 8h)
- `POST /api/admin/products/import` → generic xlsx importer
- `POST /api/admin/products/import/bewital?dry_run=<bool>&limit=<int>` → Bewital AI-enriched importer
- `GET /api/admin/products`, `POST`, `PATCH /:id`, `DELETE /:id`
- `GET /api/admin/special-offers` / `plans` / `blog-posts` / `leads` / `contact-inquiries`
- Public: `GET /api/products` (drafts hidden), `/api/special-offers`, `/api/blog/posts`, `/api/promos`
