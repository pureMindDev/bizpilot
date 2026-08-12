# BizPilot API

A Node.js / Express / MongoDB backend for the BizPilot SaaS platform — powers both the
business dashboard (`/api/...`) and the Super Admin console (`/api/admin/...`) with
**two fully separate authentication systems**, matching the frontend's design.

## Stack

- **Express** — HTTP layer
- **Mongoose / MongoDB** — data layer
- **JWT** (two separate secrets: business vs. admin) — auth
- **bcryptjs** — password hashing
- **express-validator** — request validation
- **helmet, cors, express-rate-limit** — basic hardening

## Getting started

```bash
cd server
npm install
npm run seed               # populates realistic demo data (20 businesses, staff, products, sales, admins, plans...)
npm run dev                 # starts the API on http://localhost:5000 with nodemon
```

Health check: `GET http://localhost:5000/health` — always responds, even without a DB connection,
so you can confirm the server itself is up before troubleshooting Mongo.

If MongoDB isn't reachable, every `/api/...` route responds instantly with `503` instead of
hanging (see `middlewares/requireDb.js`) — no request will ever wait on Mongoose's connection buffer.

### Demo logins (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Business owner | `damilola@ogundipe.ng` (first seeded business) | `bizpilot123` |
| Super Admin | `tolu@bizpilot.ng` | `bizpilot123` |

All seeded accounts (business staff and platform admins) share the password `bizpilot123`.

## Folder structure

```
server/
  app.js          Express app (middleware + route wiring)
  server.js       entry point (connects DB, starts listening)
  config/         env + MongoDB connection
  models/         Mongoose schemas
  middlewares/    auth guards, validation, error handling
  controllers/    request handlers, one file per resource
  routes/         Express routers, one file per resource
  services/       business logic reused across controllers (checkout logic,
                  business-stat enrichment, JWT signing/verification)
  utils/          asyncHandler, ApiError, pagination
  seed/           demo data + seed runner
```

## Two separate auth systems

Business staff and platform admins are **entirely separate collections, tokens, and secrets**:

- Business: `Staff` model, `JWT_BUSINESS_SECRET`, routes under `/api/auth/*`
- Admin: `Admin` model, `JWT_ADMIN_SECRET`, routes under `/api/admin/auth/*`

A stolen business token cannot be used against any `/api/admin/*` route and vice versa —
`protectBusiness` and `protectAdmin` middleware verify against different secrets entirely.

## API reference

### Business API (`Authorization: Bearer <business token>`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a business + its Owner account |
| POST | `/api/auth/login` | Staff login |
| POST | `/api/auth/forgot-password` | Request a reset code (emailed via Brevo, or logged to console if `BREVO_API_KEY` is unset) |
| POST | `/api/auth/reset-password` | Verify the code and set a new password |
| GET | `/api/auth/me` | Current staff profile |
| GET/POST/PATCH/DELETE | `/api/products` | Inventory CRUD |
| PATCH | `/api/products/:id/stock` | Relative stock adjustment `{ delta }` |
| GET/POST/PATCH/DELETE | `/api/customers` | Customer CRUD |
| GET/POST | `/api/sales` | POS transaction history / checkout (decrements stock, updates customer totals, raises notifications) |
| GET/POST/PATCH/DELETE | `/api/staff` | Staff management (Owner/Manager only for mutations) |
| PATCH | `/api/staff/:id/suspend` | Toggle suspension |
| GET/POST/PATCH/DELETE | `/api/expenses` | Expense tracking |
| GET | `/api/notifications` | Business notification feed |
| PATCH | `/api/notifications/:id/read`, `/read-all` | Mark read |
| GET/PATCH | `/api/business` | Own business profile & settings |
| GET | `/api/dashboard/summary` \| `/revenue-overview` \| `/top-products` \| `/revenue-by-payment-method` \| `/reports-summary` | Real aggregation queries backing the dashboard/reports charts |

### Admin API (`Authorization: Bearer <admin token>`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/auth/login` | Super Admin team login |
| GET | `/api/admin/auth/me` | Current admin profile |
| GET/PATCH/DELETE | `/api/admin/businesses` | Tenant management, enriched with live user/product/sales counts |
| PATCH | `/api/admin/businesses/:id/suspend` \| `/activate` | Status control |
| GET | `/api/admin/businesses/stats` | Platform-wide business counts |
| GET/PATCH | `/api/admin/plans` | Subscription plan management |
| PATCH | `/api/admin/plans/business/:businessId/change` | `{ action: upgrade\|downgrade\|trial\|cancel }` |
| GET | `/api/admin/payments` | Payment table + revenue summary |
| PATCH | `/api/admin/payments/:id/refund` | Refund — calls the real Paystack refund API when the payment has a `providerReference` and `PAYSTACK_SECRET_KEY` is set, otherwise a DB-only simulated refund |
| GET | `/api/admin/payments/revenue-growth` | Monthly revenue series |
| POST | `/api/webhooks/paystack` | Paystack webhook receiver (no admin auth — trust comes from HMAC signature verification). Handles `charge.success`, `charge.failed`, `refund.processed`/`refund.processing` |
| GET/PATCH/DELETE | `/api/admin/users` | Staff across every business |
| GET | `/api/admin/tickets` | Support tickets |
| PATCH | `/api/admin/tickets/:id/assign` \| `/resolve` \| `/close` | Ticket workflow |
| POST | `/api/admin/tickets/:id/comments` | Reply to a ticket |
| GET | `/api/admin/audit-logs` | Platform audit trail |
| GET/PATCH/DELETE | `/api/admin/notifications` | Platform notification center |
| GET/PATCH | `/api/admin/roles` | Role permission matrix (Super Admin only can edit) |
| GET/PATCH | `/api/admin/settings` | Platform-wide settings (branding, SMTP, payment providers, security, maintenance) |
| GET | `/api/admin/dashboard/summary` \| `/business-growth` \| `/plan-distribution` \| `/monthly-signups` \| `/top-businesses` | Admin dashboard/analytics aggregations |

## Connecting the React frontend

The frontend's `src/services/api.js` already points at `VITE_API_URL` (falling back to `/api`).
Create a `.env` in the `bizpilot/` root with:

```
VITE_API_URL=http://localhost:5000/api
```

Swapping the mock-data Contexts (`AuthContext`, `ProductContext`, etc.) over to call this API
instead of `useState(mockData)` has already been done — every context's CRUD flow calls this API.
The only leftover `mock*.js` imports are static dropdown constants (categories, statuses, roles),
which is intentional.

## Notes on scope

- Password reset sends a real 6-digit code via Brevo (`POST /api/auth/forgot-password` →
  `POST /api/auth/reset-password`), mirroring the email-verification flow. If `BREVO_API_KEY`
  isn't set, the code is logged to the server console instead of emailed, so the flow still
  works end-to-end in local dev without a Brevo account.
- Checkout (`completeCheckout` in `services/saleService.js`) runs its core writes — stock
  validation, sale creation, inventory decrement, customer totals — inside a MongoDB session/
  transaction for atomicity. Against a standalone `mongod` (which doesn't support transactions),
  it automatically falls back to running the same steps without a session, logging a warning;
  deploy against a replica set (e.g. MongoDB Atlas) to get full atomicity in production.
- Paystack refunds and webhooks are now real: `POST /api/webhooks/paystack` verifies the
  `x-paystack-signature` HMAC and updates `Payment` status on `charge.success` / `charge.failed` /
  `refund.processed`; `PATCH /api/admin/payments/:id/refund` calls Paystack's live refund API when
  a payment has a `providerReference` and `PAYSTACK_SECRET_KEY` is set. Without that key, both fall
  back to the previous DB-only simulated behavior, so local dev still works with no live account.
- Flutterwave and Stripe remain listed as payment methods in the data model but have no provider
  integration — only Paystack does. SMS sending is still simulated/UI-only.
