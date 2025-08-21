# Drove — Monorepo (Frontend + Backend)

Drove is a full‑stack app with a React (Vite) frontend and a NestJS backend.
This repo contains two workspaces:

- `drove/` — Frontend (Vite + React + TypeScript)
- `drove-back/` — Backend (NestJS + TypeORM + PostgreSQL)

---

## Features
- Auth, admin dashboard, transfers, invoices, reviews, support
- Google Maps APIs (Places, Static Maps, Routes, Distance Matrix)
- Stripe Checkout + webhook
- AWS S3 for PDF storage (pdf-lib)
- TypeORM with PostgreSQL (local or Railway)
- Swagger docs at `/docs` (backend)

---

## Prerequisites
- Node.js 20+
- pnpm/yarn/npm
- PostgreSQL 14+ (local) or a hosted Postgres (Railway)
- Accounts/keys for: Stripe, AWS S3, Google Maps

---

## Environment variables
Secrets must NOT be committed. Use local `.env` files and Railway variables in production.

### Backend (`drove-back/.env`)
```
# Postgres (local)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=changeme
PGDATABASE=drove
PGSSL=false
TYPEORM_SYNC=true

# Railway (production)
# DATABASE_URL=postgresql://user:pass@host:port/db
# PGSSL=true
# TYPEORM_SYNC=false

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
# STRIPE_API_VERSION=2024-06-20

# AWS S3
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=eu-west-2
AWS_S3_BUCKET=drove-pdf

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend base URL used for QR links in PDFs
FRONTEND_BASE_URL=http://localhost:3000/

# Optional
# PORT=3001
```

TypeORM config supports either discrete PG vars or a `DATABASE_URL` (ideal for Railway).

### Frontend (`drove/.env.local`)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Only variables prefixed with `VITE_` are exposed to the browser.

---

## Local development

### Backend
```
cd drove-back
# create .env from the example values above
# cp .env.example .env   (on Windows, create manually)

# install deps
yarn

# run dev
yarn start:dev

# swagger docs
# http://localhost:3001/docs
```

### Frontend
```
cd drove
# create .env.local with VITE_ variables
# cp .env.example .env.local   (on Windows, create manually)

# install deps
npm i

# run dev
npm run dev

# app
# http://localhost:3000
```

---

## Stripe integration
- Checkout session: `POST /payments/checkout`
- Webhook: `POST /payments/webhooks`
  - Set the endpoint in Stripe Dashboard to your public URL (local: via ngrok)
  - Use the signing secret as `STRIPE_WEBHOOK_SECRET`

Troubleshooting: ensure raw body is enabled for the webhook path. The app sets an Express raw body middleware; double‑check it matches the controller route (`/payments/webhooks`). If mismatched, the signature validation will fail.

---

## Google Maps
Provide a single `GOOGLE_MAPS_API_KEY` usable for:
- Frontend Places Autocomplete (Vite: `VITE_GOOGLE_MAPS_API_KEY`)
- Backend Static Maps, Routes, Distance Matrix

Restrict API key appropriately (HTTP referrers for frontend; IPs for backend).

---

## AWS S3
- Region/bucket/credentials come from env vars.
- PDFs are uploaded to `s3://$AWS_S3_BUCKET` and a public URL is returned.

---

## Database
The backend supports:
- Local: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSL=false`
- Railway: `DATABASE_URL` + `PGSSL=true`

Set `TYPEORM_SYNC=true` only in local development.

---

## Scripts

### Backend
- `yarn start:dev` — dev server with watch
- `yarn build` — compile to `dist/`
- `yarn start:prod` — run compiled server
- `yarn test`, `yarn test:e2e` — unit/e2e tests

### Frontend
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

---

## Deployment (Railway)
1) Create two services: `backend` (Nest) and `frontend` (Vite static or Next‑style serve).
2) Backend variables (Railway → Variables):
   - `DATABASE_URL` (Railway Postgres)
   - `PGSSL=true`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
   - `GOOGLE_MAPS_API_KEY`
   - `FRONTEND_BASE_URL=https://your-frontend-domain`
3) Frontend variables:
   - `VITE_API_BASE_URL=https://your-backend-domain`
   - `VITE_GOOGLE_MAPS_API_KEY`
4) Set backend start command: `yarn start:prod`
5) For frontend, serve the built `dist/` (Railway Nixpacks or a Node static server).
6) Configure Stripe webhook to `POST https://your-backend-domain/payments/webhooks`.

---

## Security and secrets
- Never commit secrets. Use `.env` locally and Railway variables in production.
- If a secret is leaked in git history, rotate it and rewrite history.

Rewrite history using git‑filter‑repo (Windows PowerShell):
```
python -m pip install git-filter-repo

@"
regex:sk_test_...==>REDACTED
regex:whsec_...==>REDACTED
regex:AKIA...==>REDACTED
regex:[A-Za-z0-9/+]{40}==>REDACTED
regex:AIza[0-9A-Za-z\-_]{35}==>REDACTED
"@ | Set-Content -Path .git-rewrite.replacements -Encoding UTF8

git filter-repo --replace-text .git-rewrite.replacements

git for-each-ref --format="%(refname)" refs/original/ | % { git update-ref -d $_ }

git reflog expire --expire=now --all

git gc --prune=now --aggressive

git push --force origin main
```

---

## Project structure (excerpt)
```
/README.md
/drove                 # frontend (Vite + React)
/drove-back            # backend (NestJS)
```

---

## Troubleshooting
- Stripe webhook signature invalid: confirm the raw body middleware path matches `/payments/webhooks`, and the `STRIPE_WEBHOOK_SECRET` is correct.
- 403 Google Maps: check API restrictions and that the correct key is used on both frontend/backend.
- S3 upload fails: validate bucket name/region and that the IAM user has PutObject permissions.
- DB connection fails on Railway: use `DATABASE_URL` and set `PGSSL=true`.

---

## License
MIT
