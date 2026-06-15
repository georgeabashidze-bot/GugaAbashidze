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

### P1 — next
- **Phase A7 — Bulk Importer Monitor / Draft Review UX**: filter products by `status=draft` in /admin/products, bulk-publish, bulk-delete, inline edit of EN+KA fields for the 166 imported drafts.
- **Background-job pattern**: convert the *live* Bewital import (`dry_run=False`) to an async job with `/api/admin/jobs/{id}` polling so the operator gets immediate feedback instead of waiting on a single long HTTP request.

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
