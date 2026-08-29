# Architecture

## What this is

TherapyVisit Pro is a therapy-visit documentation and billing system for contract PT/OT/SLP therapy agencies: referral intake, therapist assignment, visit note documentation (evaluation/treatment/re-eval/recert/discharge), scheduling, invoicing, payroll, and compliance (audit logs, two-admin approval for record deletion).

This is a **Next.js migration of an original Base44 app** (a low-code platform product). The migration's hard requirement was pixel-perfect UI/UX parity with the original — same layout, colors, fonts, field names, and user flows — while replacing Base44's hosted backend with a real one. A REST API was added afterward for external/programmatic access (e.g. a future mobile app), on top of the same backend.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Prisma 7** + **PostgreSQL** (via `@prisma/adapter-pg`)
- **NextAuth v5** (Credentials provider, JWT session strategy, bcrypt password hashing)
- **Vitest** for unit tests (101 tests: RBAC, validation schemas, auth helpers, audit logger)
- **Tailwind + shadcn/ui** components (ported 1:1 from the Base44 original)

## Two ways in, one backend

```
┌─────────────────┐     ┌──────────────────┐
│   Web UI (React) │     │  External client  │
│  (session cookie)│     │ (Bearer API key)  │
└────────┬─────────┘     └─────────┬─────────┘
         │                          │
         ▼                          ▼
  Server Actions              REST routes
  (src/app/**/actions.js)    (src/app/api/v1/**)
         │                          │
         └───────────┬──────────────┘
                      ▼
         requireAuth() / requireRole()
         (src/lib/auth/session.ts)
                      │
                      ▼
              Prisma → PostgreSQL
```

The web app and the REST API are **not separate implementations** — REST routes are thin wrappers that import and call the exact same server-action functions the UI calls. This was a deliberate design choice: it means the REST API can never drift from the UI's business logic, and adding a new REST endpoint is a small, low-risk change (see `docs/API.md`'s "Implementation pattern" section).

What makes both paths work through the same `requireAuth()` call: it checks for a NextAuth session cookie first, and if there isn't one, falls back to checking for an `Authorization: Bearer` header and looking up an `ApiKey` record in the database. Either way it returns the same `SessionUser` shape, so nothing downstream needs to know or care which auth method was used.

## Auth & authorization

- **Session-based** (web UI): NextAuth v5, Credentials provider, JWT strategy, 60-minute session. Config: `src/lib/auth/config.ts` / `auth.config.ts`.
- **Bearer-token-based** (REST): per-user `ApiKey` records, SHA-256 hashed at rest, generated/listed/revoked via `src/lib/auth/api-keys.ts`. A key inherits its owner's full role — there's no separate key-scoping.
- **`requireAuth()` / `requireRole(...types)`**: `src/lib/auth/session.ts` — the single choke point both auth methods flow through.
- **RBAC**: `src/lib/rbac/` — a route-level permission matrix (`RouteKey → UserType[]`) and a resource-action permission matrix, both keyed off `UserType` (`SUPERUSER | ADMIN | THERAPIST | COORDINATOR | HR | GUEST | CLIENT`).
- **`src/proxy.ts`** (formerly `middleware.ts` — renamed for Next.js 16, see below): gates every page route except `/api/auth`, `/api/v1`, and static assets, redirecting unauthenticated requests to `/login`. REST routes are excluded from this gate deliberately — they handle their own 401/403 responses as JSON rather than an HTML redirect, since a non-browser client can't follow a redirect meaningfully.
- **Audit logging**: `src/lib/audit/` — every mutating action logs who/what/when to the `AuditLog` table, visible at `/AuditLogs` and `GET /api/v1/audit-logs`.

## `middleware.ts` → `proxy.ts`

Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. This isn't just a rename: **the `proxy` runtime is always Node.js, whereas `middleware` defaulted to Edge Runtime.** This project's middleware needs the Prisma client (for the NextAuth Credentials provider's user lookup), and Prisma's Node.js driver adapter (`@prisma/adapter-pg`) can't run in Edge Runtime — it crashed in production (`next start`) on every authenticated page with `Failed to load external module node:path`. This was confirmed to be a pre-existing bug present in the app since `task-2` (where `middleware.ts` was first introduced), not something introduced later. Fixed by renaming to `proxy.ts` per Next.js 16's migration guide.

## Data model

20 Prisma models (`prisma/schema.prisma`), the core ones being:

- **User** — auth identity, `role` + `userType` (the real access-control field), optional link to a `Therapist` record
- **Patient** — demographics, insurance, therapy types, embedded JSON for responsible party / physicians / assigned therapists / visit counts
- **Therapist** — credentials, discipline (PT/OT/ST), rates, personal files & disciplinary actions (HR-gated in the UI)
- **VisitNote** — the largest model by far; every visit-type's full documentation (SOAP notes, ROM/strength eval, ADLs, goals, discharge, OASIS, signatures, etc.) stored as typed JSON columns rather than one column per field
- **Referral** / **ReferralAssignment** — intake → therapist assignment → accept/decline/schedule workflow
- **Invoice** / **InvoiceLineItem**, **Agency** / **AgencyContact** / **AgencyRate** — billing
- **Task**, **AuditLog**, **CompanyInfo**, **CommunicationNote**, **Announcement**, **CoordinatorTimeLog**, **DeletionRequest**, **Notification**, **DocumentLibrary** — supporting workflows
- **ApiKey** — bearer-token credentials for the REST API (added alongside the REST rollout)

## Directory layout

```
src/
  app/
    (auth)/login/            — public login page + its own server action
    (app)/<Domain>/          — one folder per page/domain, each with page.jsx + actions.js
    api/
      auth/[...nextauth]/    — NextAuth handler
      upload/                — file upload endpoint
      v1/<domain>/           — REST API (see docs/API.md)
  components/                — shared UI, some domains keep actions.js alongside components
                                instead of under app/ (communication-actions.js, referral-actions.js,
                                dashboard-actions.js) when the feature is patient/dashboard-scoped
                                rather than its own page
  lib/
    auth/                    — session.ts (requireAuth/requireRole), config.ts (NextAuth), api-keys.ts
    api/                     — response.ts (shared REST response helpers)
    db/                      — Prisma client singleton
    rbac/                    — permission matrices
    audit/                   — audit log writer
    validations/             — Zod schemas
prisma/
  schema.prisma
  migrations/
  seed.ts
```

## Branch history

The backend was built incrementally across a linear chain of 22 branches (`task-1-project-setup` → `task-22-form-components`, each branching from the previous one's tip), each wiring one domain from mock data to real Prisma-backed server actions. `main` is a separate, earlier UI-only mock-data scaffold — not part of this chain, not the branch to build on.

The REST API and the `proxy.ts` fix were added the same way: implemented at the branch where each domain's actions first appear (or at `task-1`/`task-2` for the shared auth foundation), then merged forward through the rest of the chain and force-pushed, so every branch's history stays consistent and each branch remains independently buildable.

## Known gaps

- PDF generation/import (invoice PDF, Excel export, visit note PDF, referral PDF import) — needs `jspdf`/`xlsx`/`pdf-parse`, not yet added
- Session timeout warning / auto-logout / user impersonation — UI-only features, not yet implemented
- No API-key management UI yet (keys are issued via `src/lib/auth/api-keys.ts` directly — see `docs/API.md`)
- No rate limiting or CORS configuration on `/api/v1/*` (not needed yet — no external browser-based caller exists)
