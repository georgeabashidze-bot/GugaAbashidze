# SmartPaw Food — Product Requirements Document

## Original Problem Statement
> Hi. I would like to build a web page for SmartPaw Food - regular delivery services for domestic cats and dogs. I can send you the link to our web page, which we would like to amend. First, you can build according to that structure and we can work after on changes. How does that sound? This is the link - https://smartpaw-draft-4.vercel.app.

## Goal
Replicate the structure of the reference site (smartpaw-draft-4.vercel.app) as a fresh, distinctive marketing landing page for **SmartPaw Food**, a Tbilisi (Georgia)-based subscription pet-food/supplies delivery service for dogs and cats.

## User Choices (verbatim)
- Scope: **Static marketing/landing page** (no e-commerce yet)
- Content: Placeholder + fresh tailored content
- Design: Modern, distinctive refresh with **brand orange + blue** palette and provided **logo**
- Languages: **English first, Georgian (KA) toggle scaffold** (translations placeholder)
- Integrations: **Lead-capture registration form** + **floating WhatsApp button** (+995591969901)

## Personas
- **Tbilisi pet parents** (dog/cat owners) wanting a hands-off, scheduled supply of vet-approved food/supplies.
- **Multi-pet households** (both species).
- **Visitors evaluating the brand** before subscribing — need fast trust signals (partners, testimonials, smart-dispenser perk).

## Architecture
- **Frontend**: React 19 + Tailwind, sectioned components in `/app/frontend/src/components/`, EN/KA context (`lib/LangContext.jsx` + `lib/i18n.js`), Cabinet Grotesk + DM Sans typography, all interactive elements carry `data-testid` from `constants/testIds.js`.
- **Backend**: FastAPI with `/api/leads` (POST + GET) persisting to MongoDB (`db.leads`); existing `/api/status` endpoints retained.
- **Brand colors**: Navy `#0A4D8C` + Orange `#F25C05` on warm off-white `#FDFBF7`.

## Implemented (Jan 2026)
- Sticky translucent header with logo, nav, EN/KA toggle, primary CTA, mobile drawer.
- Hero with collage (smart-dispenser image + golden retriever overlay + floating info chips).
- Partners marquee (7 logos, infinite scroll).
- Four alternating image+text feature sections (Vet-approved brands, Door-to-door, Tuned to your pet, Dogs+cats).
- "What we deliver" category grid (Food, Accessories, Health & Hygiene, Innovation).
- Why SmartPaw section (navy block, orange accents, badges).
- 4-step How-it-works grid.
- Blog preview cards (3 posts).
- Testimonials grid (3 quotes).
- Footer with brand, contact (Tbilisi · +995591969901 · hello@smartpaw.ge), social links.
- WhatsApp floating action button → `https://wa.me/995591969901`.
- Signup/Lead-capture modal: name, email, phone, pet_type, pet_name, pet_breed, pet_age, notes → POST `/api/leads`.
- EN/KA language toggle (full EN + placeholder KA translations).

## What's Verified
- Backend pytest suite: 7/7 passing (`/app/backend/tests/test_leads_api.py`).
- Frontend desktop + mobile flows: 100% of critical flows passing.
- No console errors. Hot reload working.

## Prioritized Backlog (P0/P1/P2)
- **P0**: Real KA translations from client (placeholder strings in `lib/i18n.js`).
- **P0**: Custom Catalogue, How-it-works, Blog, Contact full pages/routes (currently single-page anchors).
- **P1**: Server-side email + phone normalization, lead notification (SendGrid/Resend) to ops inbox.
- **P1**: Admin view of submitted leads with status (new/contacted/converted).
- **P1**: Replace placeholder partner logos with real partner brands and link out.
- **P1**: Add real intro video (or branded hero animation) to replace static collage.
- **P2**: Subscribe-plan checkout (cart, plans, Stripe).
- **P2**: Customer dashboard (pet profiles, delivery schedule).
- **P2**: Blog CMS (MDX or Sanity).
- **P2**: SEO + Open Graph tags, sitemap, multilingual routing (`/en`, `/ka`).
- **P2**: Rate-limiting + captcha on `/api/leads`.

## Next Tasks
1. Collect real Georgian copy from the client and replace placeholder KA strings.
2. Decide on hosting for client (Emergent deploy / Vercel) and configure custom domain.
3. Wire `/api/leads` to email notifications (SendGrid or Resend integration).
4. Build dedicated routes for Catalogue, How-it-works, Blog, Contact.
