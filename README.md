# TherapyVisit Pro

A therapy-visit documentation and billing system for contract PT/OT/SLP therapy agencies — referral intake, therapist assignment, visit note documentation, scheduling, invoicing, payroll, and compliance. Next.js migration of an original Base44 app, with pixel-perfect UI parity and a real Prisma/Postgres backend replacing Base44's hosted platform.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the system design and [`docs/API.md`](docs/API.md) for the REST API reference.

## Setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL, NEXTAUTH_SECRET, etc.
npx prisma migrate deploy
npx prisma db seed     # optional — loads demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test accounts

All passwords: `demo123`

| Email | Role |
|---|---|
| `superadmin@therapyvisit.com` | Superuser |
| `admin@therapyvisit.com` | Admin |
| `sarah.johnson@therapyvisit.com` | Therapist (PT) |
| `michael.chen@therapyvisit.com` | Therapist (OT) |
| `james.rivera@therapyvisit.com` | Therapist (PTA) |
| `coordinator@therapyvisit.com` | Coordinator |
| `hr@therapyvisit.com` | HR |
| `guest@therapyvisit.com` | Guest |
| `client@therapyvisit.com` | Client |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build + serve |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |

## Branches

The backend was built incrementally across `task-1-project-setup` through `task-22-form-components`, a linear chain where each branch wires one domain (patients, therapists, agencies, invoices, ...) to the real database. `task-22-form-components` has everything. `main` is a separate, earlier UI-only scaffold — not part of that chain.
