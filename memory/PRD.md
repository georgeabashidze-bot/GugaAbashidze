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
- Roadmap: 13-phase plan; user explicitly approved Phase 1 (Site Architecture & Navigation → multi-page React Router).

## Architecture
- **Frontend**: React 19 + Tailwind, **React Router DOM v7 multi-page** with shared `Layout.jsx` (Header + Footer + WhatsApp FAB + global SignupModal). EN/KA context (`lib/LangContext.jsx`), global modal context (`lib/SignupContext.jsx`), Cabinet Grotesk + DM Sans typography. All routes are sourced from `constants/routes.js`. data-testids in `constants/testIds.js`.
- **Backend**: FastAPI with `/api/leads` (POST + GET) persisting to MongoDB (`db.leads`); existing `/api/status` endpoints retained.
- **Brand colors**: Navy `#0A4D8C` + Orange `#F25C05` on warm off-white `#FDFBF7`.

## Routes (Phase 1)
- `/` Home (full marketing stack)
- `/catalogue` + `/catalogue/{food,hygiene,vitamins}`
- `/special-offers` + `/special-offers/{toys-accessories,innovation-tech,services}`
- `/how-it-works`, `/plans`, `/about`, `/blog`, `/blog/:slug`, `/contact`, `/faq`
- `/privacy`, `/terms`, `/delivery-policy`, `/refund-policy`
- `*` → NotFoundPage

## Implemented
### Jan 2026
- Sticky translucent header, hero, partners marquee, feature sections, categories grid, Why SmartPaw, How it works, blog preview, testimonials, footer.
- WhatsApp FAB + Signup/Lead-capture modal (`POST /api/leads`).
- EN/KA toggle scaffold.
- Backend pytest suite passing.

### Feb 2026 — Phase 2: Catalogue Construction (DONE, validated 100% by testing agent — iteration_3.json)
- New `Product` model + `GET /api/products` (filters: category, sub_category, pet_type, featured) + `GET /api/products/{slug}` (404 on miss).
- `backend/seed_products.py` — idempotent FastAPI startup seeder loading 18 curated products (Food / Hygiene / Vitamins × 6, mix of dog/cat/both, 6 featured).
- Tiny `lib/api.js` fetch helper + reusable `ProductCard.jsx` (click → opens global Signup modal) + `ProductGrid.jsx` (TanStack Query, with loading / error / empty / grid states).
- `SubCategoryPage.jsx` now renders the live grid when `subCategory` is supplied; `pages/SubPages.jsx` wires Food/Hygiene/Vitamins; `CataloguePage.jsx` "coming soon" banner removed.
- Backend pytest: 10/10 passing (`/app/backend/tests/test_products_api.py`). Phase 1 regressions still green.

### Feb 2026 — Phase 1: Multi-Page Architecture (DONE, validated 100% by testing agent — iteration_2.json)
- React Router DOM wired in `index.js` (BrowserRouter) + `App.js` (Routes/Route under shared `Layout`).
- `SignupProvider` and `LangProvider` hoisted to the root so the signup modal & i18n work on every route.
- `Layout.jsx` mounts Header/Footer/WhatsApp FAB/SignupModal once with `<Outlet />`; scroll-to-top on route change.
- `Header.jsx` refactored to `NavLink` (active link orange) + `Link` for logo; mobile drawer auto-closes.
- `Footer.jsx` refactored with structured Company / Explore / Legal link groups using `Link`; testids stable across languages (derived from route keys, not labels).
- 23 routes scaffolded (Home, Catalogue + 3 subs, Specials + 3 subs, How It Works, Plans, About, Blog list + slug, Contact, FAQ, 4 legal pages, 404).
- Breadcrumbs on every inner page (`PageShell` + `Breadcrumbs`).
- Hero secondary CTAs route to `/catalogue` and `/special-offers` instead of in-page scroll.

## What's Verified (Feb 2026)
- Frontend Playwright run: **40/40 critical flows passing**, no console errors (iteration_2.json).
- Verified flows: SPA navigation across all routes, active-link highlight, scroll-to-top on route change, signup modal opening from header & page-shell CTAs on inner pages, lead capture POST `/api/leads` 201 + success message, EN/KA toggle, WhatsApp FAB on every route, mobile drawer navigation.
- Backend pytest suite: still passing (`/app/backend/tests/test_leads_api.py`).

## Prioritized Backlog

### P0 — Phase 3: Special Offers Engine
- Dynamic promo banner system (list of offers; date-bounded; routing to sub-pages).
- Extend product schema with `category='specials'` + sub-categories (toys-accessories, innovation-tech, services).
- Reuse `ProductGrid` for /special-offers/* sub pages once data is seeded.

### P1 — Phase 4: Plans & Pricing
- Finalise plan tiers (Starter / Routine / Multi-Pet) once client confirms pricing.
- Comparison table component, add-ons matrix.

### P1 — Phase 5: Inside Marketing Pages
- Flesh out How It Works (timeline, FAQ inline), About (founder story, team, impact metrics).
- Contact page: embedded map + inquiry form (separate from signup) + departments.
- FAQ expansion.

### P1 — Phase 6: Blog & SEO Content
- Markdown/MDX content pipeline OR small CMS (Sanity / Strapi).
- Blog post template fleshed out (author, share, related).
- Open Graph + JSON-LD on every route.

### P1 — Phase 7: Lead & Notification Automation
- `/api/leads` → email to ops inbox via Resend or SendGrid.
- Optional WhatsApp notification via Twilio.
- Admin view of leads with status (new/contacted/converted).

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
1. **Kick off Phase 3 — Special Offers Engine** (seed `category='specials'` sub-categories: toys-accessories / innovation-tech / services; reuse ProductGrid).
2. **Phase 4 — Plans & Pricing** comparison table.
3. Collect real Georgian copy from the client and replace placeholder KA strings.
4. Wire `/api/leads` to email notifications (SendGrid or Resend) when ops inbox is confirmed.

## Architecture Notes for next agent
- Routes are centralised in `/app/frontend/src/constants/routes.js`. Edit slugs there and they propagate to header/footer/breadcrumbs.
- The signup modal is globally controlled via `useSignup()` from `lib/SignupContext.jsx`. Use `openSignup()` anywhere — no prop drilling needed.
- Every page should be wrapped in `PageShell` for consistent breadcrumbs + bottom CTA strip.
