# SmartPaw — Unified Deployment Guide (Cabinet + Marketing + Admin)

This document describes how to deploy the unified `smartpaw.ge` codebase that
includes:

- The public **marketing site** (`/`, `/catalogue`, `/blog`, etc.)
- The **admin panel** (`/admin/*`)
- The **Customer Cabinet** (`/cabinet/*`) — formerly a standalone app, now merged
  into the main repo.

All three surfaces share **one FastAPI backend** and **one MongoDB database**.

---

## 1. What changed in the codebase

### Backend (`/backend`)
- **NEW** `cabinet_routes.py` — all customer cabinet endpoints:
  - Auth: `POST /api/auth/register`, `/login`, `/logout`, `/google/session`, `GET /api/auth/me`
  - Pets: `GET/POST /api/pets`, `PATCH/DELETE /api/pets/{id}`
  - Addresses: `GET/POST /api/addresses`, plus default + delete
  - Subscriptions: `GET/POST /api/subscriptions`, plus pause/resume/cancel
  - Orders: `GET /api/orders`, `GET /api/orders/{id}`
  - Notifications: `GET/PATCH /api/notifications/prefs`
  - Cabinet-shaped product feed: `GET /api/cabinet/products`
  - Cabinet offers: `GET /api/cabinet/offers`
- **MODIFIED** `server.py` — adds `app.include_router(cabinet_router)` and
  ensures cabinet indexes at startup.
- **MODIFIED** `admin_routes.py` — adds two new endpoints used by the admin
  panel "Cabinet Customers" view:
  - `GET /api/admin/cabinet-customers`
  - `GET /api/admin/cabinet-stats`
- **UNCHANGED** `auth.py` — already supports both admin (Bearer) and customer
  (httpOnly cookie) flows. Cabinet routes reuse `set_auth_cookies` and
  `get_current_user` directly.

### Frontend (`/frontend/src`)
- **NEW** `cabinet/` directory — entire customer cabinet UI:
  - `cabinet/CabinetApp.jsx` — cabinet's React Router subtree (mounted under
    `/cabinet/*`)
  - `cabinet/pages/*` — Login, RegisterWizard, Dashboard, Subscriptions,
    Catalogue, Pets, Addresses, Orders, Offers, Profile, Notifications
  - `cabinet/components/layout/*` — AppShell, BrandMark, LanguageToggle, etc.
  - `cabinet/context/AuthContext.js` — cabinet auth context (cookie-based)
  - `cabinet/i18n/{en,ka}.js` — bilingual strings
  - `cabinet/lib/api.js` — axios client with `withCredentials: true`
  - `cabinet/cabinet.css` — Shadcn HSL design tokens **scoped** under
    `.cabinet-scope` so they don't leak to the main site
- **MODIFIED** `App.js` — adds:
  ```jsx
  <Route path="/cabinet/*" element={<CabinetMount />} />
  <Route path="/admin/cabinet-customers" element={<AdminCabinetCustomers />} />
  ```
- **MODIFIED** `pages/admin/AdminLayout.jsx` — adds "Cabinet Customers" sidebar
  link.
- **MODIFIED** `pages/admin/AdminViewers.jsx` — exports new
  `AdminCabinetCustomers` view with name / email / phone / subs / pets columns.
- **MODIFIED** `lib/adminApi.js` — adds `listCabinetCustomers()` and
  `cabinetStats()` helpers.

---

## 2. Required environment variables

Set these in your production environment (Vercel/Railway/etc.):

```env
# --- Database
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>/smartpaw
DB_NAME=smartpaw

# --- Auth & secrets
JWT_SECRET=<64+ char random hex>          # used to sign customer cookies AND admin tokens
ADMIN_EMAIL=admin@smartpaw.ge             # seeded as role=admin on first boot
ADMIN_PASSWORD=<strong password>

# --- Resend admin notifications (new cabinet registrations)
RESEND_API_KEY=re_Mhzmf8Nb_2KCLcv1sxZqHgsFsBjTqW63u
SENDER_EMAIL=onboarding@resend.dev        # verify your own domain to remove the "via resend" tag later
ADMIN_NOTIFY_EMAIL=george.abashidze@gmail.com

# --- CORS / site
CORS_ORIGINS=https://smartpaw.ge,https://www.smartpaw.ge
SITE_URL=https://smartpaw.ge
UPLOAD_DIR=/app/backend/uploads           # local fs path for admin image uploads
```

For the **frontend**, only one variable matters and it is the same as before:
```env
REACT_APP_BACKEND_URL=https://smartpaw.ge     # same origin as the frontend
```

---

## 3. Database notes

- Cabinet users share the **same `db.users` collection** as the admin login
  (this is already the design from `auth.py`). Cabinet users have
  `role="customer"`, admin users have `role="admin"`.
- Cabinet uses these additional collections:
  `pets`, `addresses`, `subscriptions`, `orders`,
  `notification_prefs`, `cabinet_offers`, `user_sessions` (legacy — no longer
  written; cookie JWTs replaced this).
- Products are read from the existing **legacy** `db.products` collection
  (managed by the admin panel) — single source of truth. The cabinet wraps each
  document into its bilingual shape via `/api/cabinet/products`.
- Indexes are created idempotently at startup; see `server.py:startup_seed_products`.

---

## 4. URL map (final)

| Path                                | Surface                | Auth                        |
| ----------------------------------- | ---------------------- | --------------------------- |
| `/`, `/catalogue`, `/blog`, etc.    | Marketing site         | Public                      |
| `/admin/login`                      | Admin login            | Public                      |
| `/admin/*`                          | Admin panel            | Bearer JWT (localStorage)   |
| `/admin/cabinet-customers`          | List of cabinet users  | Admin                       |
| `/cabinet/login`                    | Customer sign-in       | Public                      |
| `/cabinet/register`                 | Customer wizard signup | Public                      |
| `/cabinet/dashboard`                | Customer home          | httpOnly cookie             |
| `/cabinet/{subscriptions,catalogue,offers,pets,addresses,orders,profile,notifications}` | Customer app | httpOnly cookie |

All API endpoints (backend) keep the `/api/*` prefix.

---

## 5. Deployment steps

### 5a. Push the merged code to GitHub

```bash
cd <your local clone of GugaAbashidze>
git fetch
git checkout -b cabinet-merge
# Copy the files from this sandbox into your local repo:
#   backend/{cabinet_routes.py, admin_routes.py, server.py, requirements.txt}
#   frontend/src/cabinet/*       (entire new directory)
#   frontend/src/App.js
#   frontend/src/pages/admin/{AdminLayout.jsx, AdminViewers.jsx}
#   frontend/src/lib/adminApi.js
#   frontend/package.json        (only if you want yarn.lock to update)
git add backend/cabinet_routes.py backend/admin_routes.py backend/server.py backend/requirements.txt
git add frontend/src/cabinet frontend/src/App.js frontend/src/pages/admin/AdminLayout.jsx frontend/src/pages/admin/AdminViewers.jsx frontend/src/lib/adminApi.js
git commit -m "feat: merge customer cabinet under /cabinet/*"
git push origin cabinet-merge
# Open a Pull Request, review, and merge to main
```

### 5b. Update dependencies on the host

After deploy, install the new Python packages on the backend:
```bash
pip install -r backend/requirements.txt
# new: resend, httpx (the rest were already present)
```

Frontend gets all deps via:
```bash
cd frontend && yarn install
```

### 5c. First-boot behaviour

On first boot of the merged backend:
1. `seed_admin` runs and creates/updates the single admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
2. Cabinet indexes are created on `users`, `pets`, `addresses`, `subscriptions`, `orders`, `notification_prefs`, `cabinet_offers`.
3. Existing marketing seeds (`seed_products_if_empty`, `seed_promos_if_empty`, etc.) run — these are unchanged.
4. **No data migration needed.** Existing admin sessions and product data
   continue to work untouched.

---

## 6. Verification checklist

Run these after each deploy:

- [ ] `GET https://smartpaw.ge/` → marketing homepage renders (no regressions)
- [ ] `GET https://smartpaw.ge/admin/login` → admin login still works
- [ ] `POST https://smartpaw.ge/api/admin/login` → returns Bearer token
- [ ] `GET https://smartpaw.ge/cabinet/login` → cabinet login page renders
- [ ] `POST https://smartpaw.ge/api/auth/register` → 200 + httpOnly cookies set + Resend email arrives at `ADMIN_NOTIFY_EMAIL`
- [ ] `GET https://smartpaw.ge/cabinet/dashboard` → renders after login
- [ ] `GET https://smartpaw.ge/cabinet/catalogue` → products load from admin DB
- [ ] `GET https://smartpaw.ge/admin/cabinet-customers` → new registrant visible

---

## 7. Rollback plan

If anything breaks after the merge:
1. Re-deploy the previous commit (the cabinet code is fully additive — there
   are no breaking changes to the marketing site or admin panel).
2. The customer cabinet stops serving but the marketing site and admin panel
   continue working.
