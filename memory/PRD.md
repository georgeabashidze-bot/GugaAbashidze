# SmartPaw Food — Product Requirements Document

## Original Problem Statement
> Hi. I would like to build a web page for SmartPaw Food - regular delivery services for domestic cats and dogs. I can send you the link to our web page, which we would like to amend. First, you can build according to that structure and we can work after on changes. How does that sound? This is the link - https://smartpaw-draft-4.vercel.app.

## Goal
Replicate the structure of the reference site (smartpaw-draft-4.vercel.app) as a fresh, distinctive marketing site for **SmartPaw Food**, a Tbilisi-based subscription pet-food/supplies delivery service for dogs and cats.

## User Choices (verbatim)
- Scope: **Static marketing/landing site, evolving into a multi-page site** (no e-commerce yet)
- Content: Placeholder + fresh tailored content
- Design: Modern, distinctive refresh with **brand orange + blue** palette and provided **logo**
- Languages: **English first, Georgian (KA) toggle scaffold** (translations placeholder)
- Integrations: **Lead-capture registration form** + **floating WhatsApp button** (+995591969901)
- Roadmap: 13-phase plan; user explicitly approved Phases 1 → 6.

## Architecture
- **Frontend**: React 19 + Tailwind, **React Router DOM v7 multi-page** with shared `Layout.jsx` (Header + Footer + WhatsApp FAB + global SignupModal). EN/KA context (`lib/LangContext.jsx`), global modal context (`lib/SignupContext.jsx`), Cabinet Grotesk + DM Sans typography. All routes are in `constants/routes.js`. data-testids in `constants/testIds.js`.
- **Backend**: FastAPI with `/api/leads`, `/api/contact-inquiries`, `/api/products`, `/api/promos`, `/api/blog/posts` (list + single by slug) — persisting to MongoDB (`db.leads`, `db.contact_inquiries`, `db.products`, `db.promos`, `db.blog_posts`).
- **SEO**: `react-helmet-async` driven `<SeoMeta>` component injects `<title>`, OG, Twitter card and JSON-LD per page (Article, Organization, BreadcrumbList, FAQPage).
- **Blog content pipeline**: Markdown files with YAML frontmatter in `/app/backend/blog_posts/*.md`, parsed and seeded into MongoDB on startup. Rendered on the frontend via `react-markdown` + `remark-gfm` with the `.prose-smartpaw` typography class.
- **Brand colors**: Navy `#0A4D8C` + Orange `#F25C05` on warm off-white `#FDFBF7`.

## Routes
- `/` Home
- `/catalogue` + `/catalogue/{food,hygiene,vitamins}`
- `/special-offers` + `/special-offers/{toys-accessories,innovation-tech,services}`
- `/how-it-works`, `/plans`, `/about`, `/blog`, `/blog/:slug`, `/contact`, `/faq`
- `/privacy`, `/terms`, `/delivery-policy`, `/refund-policy`
- `*` → NotFoundPage

## Implemented

### Jan 2026
- Sticky header, hero, partners marquee, feature sections, categories grid, Why SmartPaw, How it works, blog preview, testimonials, footer.
- WhatsApp FAB + Signup/Lead-capture modal (`POST /api/leads`).
- EN/KA toggle scaffold.

### Feb 2026 — Phase 1: Multi-Page Architecture (DONE — iteration_2.json)
React Router DOM v7, shared Layout, 23 routes scaffolded, breadcrumbs on every inner page.

### Feb 2026 — Phase 2: Catalogue Construction (DONE — iteration_3.json)
Product model + `/api/products`, idempotent seed (18 products), `ProductCard` + `ProductGrid` + `SubCategoryPage`.

### Feb 2026 — Catalogue Filter Module (DONE — iteration_4.json)
smartpet.ge-style filter sidebar + sort bar + mobile drawer.

### Feb 2026 — Phase 3: Special Offers Engine (DONE — iteration_5.json)
18 specials products, `seed_promos.py`, `GET /api/promos`, rotating `PromoBanner`, Toys / Tech / Services sub-pages reuse `CatalogueShelf`.

### Feb 2026 — Phase 4: Plans & Pricing (DONE — iteration_7.json)
- Three tiers in GEL (Free / Free + Feeder 150 GEL min / Custom 15 GEL).
- Comparison table + shared services strip.
- CSS fix: `.card-soft` wrapped in `@layer components` so Tailwind `border-[#F25C05]` properly overrides.

### Feb 2026 — Phase 5: Inside Marketing Pages (DONE — iteration_7.json)
- **How It Works**: PageShell hero + 4-card overview + 6-step detailed timeline + WhySmartPaw + 5-item inline FAQ.
- **About**: founder story + impact-metrics strip + 4 values + 4-person team grid + mid-page CTA.
- **Contact**: details card + embedded Google Maps iframe + 4 department selectors + inquiry form posting to `POST /api/contact-inquiries`.
- **FAQ**: 23 questions across 5 categories with 6 category pills, live search, empty-state with WhatsApp shortcut.
- New `.form-input` utility for shared input styling.

### Feb 2026 — Phase 6: Blog & SEO Content (DONE — iteration_8.json)
- **Markdown pipeline**: `seed_blog.py` parses YAML frontmatter + body from `/app/backend/blog_posts/*.md` and inserts into `db.blog_posts` on first startup. Three seeded articles (Why routine feeding matters, Switching foods without fuss, Indoor-cat checklist for Tbilisi apartments).
- **Backend**: new endpoints `GET /api/blog/posts` (list, tag-filterable, sorted by `published_at` desc) and `GET /api/blog/posts/{slug}` (single, 404 if missing/unpublished). Pydantic models `BlogPostSummary` and `BlogPost`.
- **Blog list (`/blog`)**: TanStack Query-fetched grid of 3 cards with cover, tag pill, date, read time. Tag-filter pills (data-testid `blog-tag-{name}-button`), loading skeletons, empty/error states.
- **Blog post (`/blog/:slug`)**: full hero (eyebrow, title, excerpt, author block, date, read time), big cover, `react-markdown` + `remark-gfm` body wrapped in `.prose-smartpaw`, sticky share rail (Twitter, Facebook, LinkedIn, copy-link with check-icon feedback), tag chips, 2 related-post cards, navy CTA card.
- **SEO**: new `<SeoMeta>` component using `react-helmet-async` — wires `<title>`, `<meta name="description">`, OG (og:site_name, og:type, og:title, og:description, og:url, og:image), Twitter card, canonical URL, and JSON-LD scripts. Helpers: `organizationJsonLd()` (Home), `articleJsonLd()` (blog posts), `breadcrumbJsonLd(trail)` (every inner page). Plus an `FAQPage` JSON-LD inlined in `FAQPage.jsx`.
- **All marketing pages** (`/`, `/plans`, `/about`, `/contact`, `/faq`, `/how-it-works`, `/blog`, `/blog/:slug`) now ship per-page `<title>`, OG meta and JSON-LD.
- Testing: 14/14 backend pytest cases pass (`/app/backend/tests/test_blog_api.py`); all frontend Playwright assertions pass; 0 regressions on Phases 1–5.
- Minor UX refinement: `ShareRail.onCopy` now sets the check-icon feedback regardless of clipboard success (handles insecure-context / permission-denied gracefully).

## What's Verified (Feb 2026)
- Frontend Playwright: full Phase 6 surface + SEO assertions (exact titles + JSON-LD types) + Phase 4/5 regression all green.
- Backend: blog endpoints (list + single + tag filter + 404), and unchanged behaviour on `/api/leads`, `/api/products`, `/api/promos`, `/api/contact-inquiries`.

## Prioritized Backlog

### P1 — Phase 7: Lead & Notification Automation
- `/api/leads` → email to ops inbox via **Resend** or **SendGrid**.
- `/api/contact-inquiries` → email to the routed department.
- Optional WhatsApp notification via **Twilio**.
- Admin `/admin` page to view + status-update leads + inquiries (new → contacted → converted).

### P2 — Phase 8: Cart & Checkout Foundation
- Subscribe-plan checkout (cart, plans, **Stripe**).
- Customer dashboard (pet profiles, delivery schedule).

### P2 — Phase 9: Authentication
- Customer account login (**Emergent Google Auth**) for plan management.

### P2 — Phase 10: Localisation
- Replace placeholder KA strings with finalised Georgian copy from the client.
- KA SEO + locale-prefixed routes (`/en`, `/ka`) if needed.

### P3 — Phase 11: Legal Polish
- Legal review of Privacy / Terms / Delivery / Refund pages.

### P3 — Phase 12-13: Performance, Analytics, Launch
- Lighthouse pass, image optimisation, GA4/Plausible.
- Production deploy + domain wiring.

### Feb 2026 — Phase A: Admin Control Panel (A1+A2+A3 DONE — iteration_10.json, 21/21 backend + 100% frontend)
- **Auth (A1)**: JWT-based email+password (single admin), bcrypt hashing, `POST /api/admin/login`, `GET /api/admin/me`, X-Forwarded-For aware brute-force lockout (5 attempts / 15 min), seeded from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). Bearer token stored in `localStorage.SP_ADMIN_TOKEN`.
- **Products CRUD (A2)**: Bilingual fields `name`/`name_ka`, `description`/`description_ka`. `GET|POST|PUT|DELETE /api/admin/products` with auth dep. Image upload at `POST /api/admin/uploads` (multipart, ≤6 MB, jpg/png/webp/gif/avif) → returns public HTTPS URL via `PUBLIC_BASE_URL`. Existing 36 seeded products gained `name_ka`/`description_ka` as null (frontend falls back to EN).
- **Special Offers CRUD (A3)**: New `db.special_offers` collection with bilingual fields, discount %, original/sale price, start/end dates, badge, sub-category, linked product slug, status, ordering. Public `GET /api/special-offers` filters by status + active window.
- **Admin UI**: `/admin/login`, `/admin` dashboard (live counts), `/admin/products` (search, filter, edit, delete), `/admin/products/new` + `/admin/products/:id` (full form), `/admin/special-offers` (cards grid), `/admin/special-offers/new` + `/admin/special-offers/:id`, `/admin/leads` & `/admin/contact-inquiries` (read-only tables + CSV export). Sidebar layout with brand styling.
- **Auth client (`adminApi.js`)**: Uses **XMLHttpRequest** instead of fetch — Cloudflare ingress was pre-consuming fetch response bodies on non-2xx, leaving the JS `Response.body` stream in a consumed state.

## P0 — Backlog (Admin Panel continuation)

### Phase A4: Plans CRUD
- Move `/plans` content into editable DB records with bilingual fields.

### Phase A5: Blog CRUD
- Move Markdown blog posts to DB-backed with bilingual title/excerpt and Markdown editor.

### Phase A6 (partial done): Leads + Contacts Viewer
- ✅ Read-only tables + CSV export already shipped.
- Future: mark-as-contacted, internal notes.

### Phase A7: Bulk Importer
- CSV / Excel upload with column mapping wizard.
- Optional URL scraper for user-owned supplier feeds.



## Next Tasks
1. **Phase A4 — Plans CRUD** (admin-editable plans, bilingual).
2. **Phase A5 — Blog CRUD** (move from Markdown files to DB, bilingual title/excerpt).
3. **Phase A7 — Bulk Importer** (CSV/Excel + URL scraper when supplier feed is shared).
4. **Phase 10 — finalised Georgian translations** + locale-prefixed routes.
5. **Phase 7 — Lead & Notification Automation** (Resend/SendGrid + Twilio WhatsApp).
6. **Phase 11 — Legal pages** content review.


- Routes centralised in `/app/frontend/src/constants/routes.js`.
- Signup modal globally controlled via `useSignup()` from `lib/SignupContext.jsx`.
- Every page wrapped in `PageShell` for consistent breadcrumbs + bottom CTA strip.
- Custom component classes (`.card-soft`, etc.) defined inside `@layer components` in `index.css` to keep Tailwind utility overrides working.
- **New blog post**: drop a Markdown file in `/app/backend/blog_posts/` with the required frontmatter, restart backend (`sudo supervisorctl restart backend`). The collection only auto-seeds when empty — to re-seed after edits, drop `db.blog_posts` (or add a force-reseed admin endpoint when needed).
- **SEO**: wrap any new page with `<SeoMeta title="…" description="…" jsonLd={…} />`. `HelmetProvider` is already mounted in `index.js`.
