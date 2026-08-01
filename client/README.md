# BizPilot — Client (React + Vite)

The BizPilot frontend: a business dashboard (POS, inventory, sales, customers,
staff, expenses, reports) plus a separate Super Admin platform console.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
```

`/api` is proxied to the Express server on `http://localhost:5000` during
development, so start the server first (see `../server/README.md`).

To point at a deployed API instead, create `.env`:

```
VITE_API_URL=https://your-api-host.com/api
```

## Scripts

| Script            | Description                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the dev server with HMR   |
| `npm run build`   | Production build to `dist/`     |
| `npm run preview` | Preview the production build    |
| `npm run lint`    | Lint with Oxlint                |

## Structure

```
src/
  components/   Shared UI + layout/admin chrome
  contexts/     API-backed state providers (auth, products, sales, admin...)
  data/         Static option lists (categories, statuses, agents)
  features/     Route-level screens, grouped by domain
  layouts/      Auth, dashboard and admin shells
  pages/        Auth + admin login screens
  routes/       Route table and route guards
  services/     Axios API client (business + admin tokens)
  styles/       SCSS variables and global styles
  utils/        Formatting, error and normalisation helpers
```

Both dashboards read and write real data through the API — business screens use
the `bizpilot_token` session, the admin console uses a separate
`bizpilot_admin_token` so a leaked business token can never reach the console.
