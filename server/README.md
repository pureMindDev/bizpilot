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
cp .env.example .env      # then edit MONGODB_URI etc. if needed
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
| POST | `/api/auth/forgot-password` | Request a reset (mock — no email sent) |
| POST | `/api/auth/reset-password` | Set a new password |
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
| PATCH | `/api/admin/payments/:id/refund` | Simulated refund |
| GET | `/api/admin/payments/revenue-growth` | Monthly revenue series |
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
instead of `useState(mockData)` is a separate, deliberate follow-up step — this backend is
ready to be wired in whenever you want to do that.

## Notes on scope

- Password reset is a mock flow (no email/SMS delivery is actually sent) — the endpoint exists
  and behaves correctly, but there's no email provider wired up.
- MongoDB transactions aren't used for checkout (works fine against a standalone `mongod`;
  if you deploy against a replica set, wrapping `createSale` in a session/transaction is a
  reasonable hardening step for perfect atomicity).
- Refunds, payment provider webhooks (Paystack/Flutterwave/Stripe), and SMTP/SMS sending are
  simulated/UI-only, matching what the frontend already treats as simulated.
