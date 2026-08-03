# BizPilot

A business-management SaaS: a React/Vite dashboard (this folder) backed by a Node.js/Express/
MongoDB API (`server/`). Two fully separate login systems — a business dashboard for shop owners
and staff, and a Super Admin console for the platform team.

See `server/README.md` for the full API reference, folder structure, and auth model.

## Local setup

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # edit MONGODB_URI, JWT secrets, etc.
npm run seed                # demo data: 20 businesses, staff, products, sales, admins...
npm run dev                 # http://localhost:5000

# 2. Frontend (separate terminal, from the repo root)
npm install
cp .env.example .env        # VITE_API_URL — defaults to http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

Demo logins (after seeding) are listed in `server/README.md`.

## Deploying

The frontend and backend deploy as two separate services. Roughly:

### 1. Database — MongoDB Atlas

Create a free-tier cluster, add a database user, and allow network access from your backend
host (or `0.0.0.0/0` if your platform uses dynamic egress IPs). Grab the connection string —
it becomes `MONGODB_URI`. Atlas clusters are replica sets, so checkout transactions
(`services/saleService.js`) get full atomicity here, unlike a standalone local `mongod`.

### 2. Backend — Render / Railway / Fly / any Node host

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Set these environment variables:

  | Variable | Value |
  |---|---|
  | `NODE_ENV` | `production` |
  | `PORT` | usually set automatically by the platform |
  | `MONGODB_URI` | your Atlas connection string |
  | `CLIENT_URL` | your deployed frontend URL, e.g. `https://bizpilot.vercel.app` (used for CORS) |
  | `JWT_BUSINESS_SECRET` / `JWT_ADMIN_SECRET` | two long random strings — **not** the `.env.example` placeholders. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, run twice |
  | `JWT_EXPIRES_IN` | `7d` (or your preference) |
  | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | from [app.brevo.com](https://app.brevo.com/settings/keys/api) — required for real verification/reset emails; without it, codes are logged to the server console instead, which you won't be able to read in production |
  | `PAYSTACK_SECRET_KEY` | from your [Paystack dashboard](https://dashboard.paystack.com/#/settings/developer) — required for real refunds and webhook verification |

  Then run `npm run seed` once against the production database (via the platform's shell/console,
  or temporarily from your machine with `MONGODB_URI` pointed at Atlas) if you want starter data —
  otherwise skip it and register a real business through the app instead.

- After deploying, register the webhook in your Paystack dashboard pointing at
  `https://<your-backend-domain>/api/webhooks/paystack`, subscribed to at least
  `charge.success`, `charge.failed`, and `refund.processed`.

### 3. Frontend — Vercel / Netlify / any static host

- Root directory: repo root (not `server`)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` = `https://<your-backend-domain>/api`

### Notes specific to deployment

- `app.js` sets `trust proxy` only when `NODE_ENV=production`, so the auth rate limiter and
  audit-log IPs read the real client IP instead of the platform's load balancer — make sure
  `NODE_ENV` is actually set to `production`, not left unset.
- `GET /health` on the backend always responds (even mid-DB-outage) — point your host's health
  check at it.
- CORS only allows the single origin in `CLIENT_URL`. If you ever serve the frontend from more
  than one domain (e.g. a staging + production URL), `cors({ origin: env.clientUrl })` in `app.js`
  will need to accept an array instead of a string.
