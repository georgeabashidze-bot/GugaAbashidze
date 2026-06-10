# SmartPaw Food — Product Requirements Document

## Original Problem Statement
> Hi. I would like to build a web page for SmartPaw Food - regular delivery services for domestic cats and dogs. I can send you the link to our web page, which we would like to amend. First, you can build according to that structure and we can work after on changes. How does that sound? This is the link - https://smartpaw-draft-4.vercel.app.

## Goal
Replicate the structure of the reference site (smartpaw-draft-4.vercel.app) as a fresh, distinctive marketing site for **SmartPaw Food**, a Tbilisi (Georgia)-based subscription pet-food/supplies delivery service for dogs and cats.

## User Choices (verbatim)
- Scope: **Static marketing/landing site, evolving into a multi-page site** (no e-commerce yet)
- Content: Placeholder + fresh tailored content
- Design: Modern, distinctive refresh with **brand orange + blue** palette and provided **logo**
- Languages: **English first, Georgian (KA) toggle scaffold** (translations placeholder)
- Integrations: **Lead-capture registration form** + **floating WhatsApp button** (+995591969901)
- Roadmap: 13-phase plan; user explicitly approved Phases 1 → 5.

## Architecture
- **Frontend**: React 19 + Tailwind, **React Router DOM v7 multi-page** with shared `Layout.jsx` (Header + Footer + WhatsApp FAB + global SignupModal). EN/KA context (`lib/LangContext.jsx`), global modal context (`lib/SignupContext.jsx`), Cabinet Grotesk + DM Sans typography. All routes are sourced from `constants/routes.js`. data-testids in `constants/testIds.js`.
- **Backend**: FastAPI with `/api/leads` (POST + GET) + `/api/contact-inquiries` (POST + GET) + `/api/products` + `/api/promos`, persisting to MongoDB (`db.leads`, `db.contact_inquiries`, `db.products`, `db.promos`).
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
- React Router DOM v7, shared Layout, 23 routes scaffolded, breadcrumbs on every inner page.

### Feb 2026 — Phase 2: Catalogue Construction (DONE — iteration_3.json)
- Product model + `/api/products`, idempotent seed (18 products), `ProductCard` + `ProductGrid` + `SubCategoryPage`.

### Feb 2026 — Catalogue Filter Module (DONE — iteration_4.json)
- smartpet.ge-style filter sidebar + sort bar + mobile drawer (`ProductFilters.jsx`, `CatalogueShelf.jsx`).

### Feb 2026 — Phase 3: Special Offers Engine (DONE — iteration_5.json)
- 18 specials products, `seed_promos.py`, `GET /api/promos`, rotating `PromoBanner`, Toys / Tech / Services sub-pages reuse `CatalogueShelf`.

### Feb 2026 — Phase 4: Plans & Pricing (DONE — iteration_7.json)
- Three tiers in GEL (Free / Free + Feeder 150 GEL min / Custom 15 GEL).
- Comparison table + shared services strip.
- **CSS fix**: `.card-soft` wrapped in `@layer components` in `index.css` so Tailwind `border-[#F25C05]` properly overrides the base border-color. Computed border-color on featured card now `rgb(242, 92, 5)`.

### Feb 2026 — Phase 5: Inside Marketing Pages (DONE — iteration_7.json)
- **How It Works** (`/how-it-works`): PageShell hero + 4-card overview + 6-step detailed timeline + WhySmartPaw + 5-item inline FAQ (first open by default).
- **About** (`/about`): founder-story narrative, navy metrics strip (1,200+ pets, 36 SKUs, <60 min reply, 0 GEL delivery), 4 values, 4-person team grid (Tornike / Nina / Luka / Mariam), mid-page CTA.
- **Contact** (`/contact`): details card, embedded Google Maps iframe (Tbilisi), 4 department selectors, inquiry form posting to new `POST /api/contact-inquiries` (validates, shows success / error states).
- **FAQ** (`/faq`): 23 questions across 5 categories (Plans, Delivery, Products, Feeder, Account), 6 category pills, live search, empty-state with WhatsApp shortcut.
- **Backend**: new `ContactInquiry` model + `POST/GET /api/contact-inquiries` (persisted to `db.contact_inquiries`).
- **CSS**: new `.form-input` utility class for shared input/textarea styling.
- Testing: 71/72 frontend assertions pass, 6/6 backend, 0 regressions.

## What's Verified (Feb 2026)
- Frontend Playwright: Plans regression fixed, all Phase 5 pages functional. WhatsApp links resolve to `https://wa.me/995591969901`. Signup modal opens from every inner page CTA.
- Backend: `POST /api/contact-inquiries` returns 201 with proper schema; empty payload returns 422; existing endpoints unchanged.

## Prioritized Backlog

### P1 — Phase 6: Blog & SEO Content
- Markdown/MDX content pipeline OR small CMS (Sanity / Strapi).
- Blog post template fleshed out (author, share, related).
- Open Graph + JSON-LD on every route.

### P1 — Phase 7: Lead & Notification Automation
- `/api/leads` → email to ops inbox via Resend or SendGrid.
- `/api/contact-inquiries` → email to the routed department.
- Optional WhatsApp notification via Twilio.
- Admin view of leads + inquiries with status (new/contacted/converted).

### P2 — Phase 8: Cart & Checkout Foundation
- Subscribe-plan checkout (cart, plans, Stripe).
- Customer dashboard (pet profiles, delivery schedule).

### P2 — Phase 9: Authentication
- Customer account login (Emergent Google Auth) for plan management.

### P2 — Phase 10: Localisation
- Replace placeholder KA strings with finalised Georgian copy from client.
- KA SEO + locale-prefixed routes (`/en`, `/ka`) if needed.

### P3 — Phase 11: Legal Polish
- Legal review of Privacy / Terms / Delivery / Refund pages.

### P3 — Phase 12-13: Performance, Analytics, Launch
- Lighthouse pass, image optimisation, GA4/Plausible.
- Production deploy + domain wiring.

## Next Tasks
1. **Phase 6 — Blog & SEO content** (Markdown/MDX pipeline + post template + Open Graph).
2. **Phase 7 — Email automation** (Resend/SendGrid for /api/leads and /api/contact-inquiries).
3. Collect real Georgian copy from the client and replace placeholder KA strings.

## Architecture Notes
- Routes centralised in `/app/frontend/src/constants/routes.js`.
- Signup modal globally controlled via `useSignup()` from `lib/SignupContext.jsx`.
- Every page wrapped in `PageShell` for consistent breadcrumbs + bottom CTA strip.
- Custom component classes (`.card-soft`, etc.) should be defined inside `@layer components` in `index.css` to keep Tailwind utility overrides working.
