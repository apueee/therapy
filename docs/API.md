# REST API Reference

TherapyVisit Pro exposes a REST API under `/api/v1` alongside the Next.js Server Actions that power the web UI. Both hit the exact same underlying business logic — the REST layer is a thin wrapper around the existing server actions, not a separate implementation. This means REST and the web app always stay in sync automatically.

## Authentication

Two auth methods are supported, transparently, on every endpoint:

1. **Session cookie** — the same NextAuth session the web app uses. Works automatically if you're calling from an already-authenticated browser session.
2. **Bearer API key** — for external/programmatic access (e.g. a mobile app or a server-to-server integration). Send it as a header:

   ```
   Authorization: Bearer tvp_<64 hex chars>
   ```

There is currently **no self-service UI** for generating API keys — they're issued via `src/lib/auth/api-keys.ts`:

```ts
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/auth/api-keys";

const { rawKey } = await generateApiKey(userId, "my integration");
// rawKey is only ever returned here — only its SHA-256 hash is stored.
// Treat it like a password: if you lose it, revoke and generate a new one.
```

A key inherits the full role/permissions of the user it's tied to (same `requireAuth()`/`requireRole()` checks as the session-based path — there's no separate scoping/permission model for keys).

### Auth errors

| Status | Meaning |
|---|---|
| `401 Unauthorized` | No valid session cookie or bearer token |
| `403 Forbidden` | Authenticated, but the user's role doesn't have access to this action |
| `404 Not Found` | Resource doesn't exist (or, for detail-record endpoints, doesn't exist under the given ID) |

Error responses are always `{ "error": "<message>" }`.

## Response shape

Success responses return the resource directly (no envelope):

```json
// GET /api/v1/patients
[{ "id": "...", "first_name": "...", ... }, ...]
```

```json
// POST /api/v1/patients
{ "success": true, "id": "0a1b2c..." }
```

All field names are `snake_case` (matching the web app's existing convention — the REST layer doesn't introduce a separate casing scheme).

## Identity-guarded endpoints

A handful of endpoints represent "my own" data (my tasks, my time logs, my notifications). These **always** derive identity from the authenticated caller — any client-supplied email/id in the request is ignored. This was a deliberate hardening pass: the underlying server actions were written for a trusted web UI that always passes its own session user's identity, so wrapping them for REST (where a caller could otherwise pass someone else's email) required this guard. These are marked **🔒 self-scoped** below.

---

## Endpoints

### Users
*(requires SUPERUSER or ADMIN)*

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/users` | List all users |
| POST | `/api/v1/users` | Body: `{ email, userType }`. Invites a user (default password `changeme123`) |
| PATCH | `/api/v1/users/[id]` | Body: `{ data: {...} }` |

### Patients

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/patients` | List patients |
| POST | `/api/v1/patients` | Create |
| GET | `/api/v1/patients/[id]` | 404 if not found |
| PATCH | `/api/v1/patients/[id]` | Partial update |
| DELETE | `/api/v1/patients/[id]` | SUPERUSER/ADMIN only |
| GET | `/api/v1/patients/[id]/visits` | Visit history for this patient |
| GET | `/api/v1/patients/[id]/communication-notes` | Communication notes for this patient |
| POST | `/api/v1/patients/[id]/communication-notes` | Body: `{ patientName, note, noteType }` |

### Therapists
*(list/detail require SUPERUSER, ADMIN, COORDINATOR, or HR)*

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/therapists` | List |
| POST | `/api/v1/therapists` | Create (SUPERUSER/ADMIN/HR) |
| GET | `/api/v1/therapists/[id]` | Detail |
| PATCH | `/api/v1/therapists/[id]` | Update (SUPERUSER/ADMIN/HR) |
| DELETE | `/api/v1/therapists/[id]` | SUPERUSER/ADMIN only |

### Agencies
*(SUPERUSER/ADMIN/COORDINATOR for read, SUPERUSER/ADMIN for write)*

| Method | Path |
|---|---|
| GET | `/api/v1/agencies` |
| POST | `/api/v1/agencies` |
| GET | `/api/v1/agencies/[id]` |
| PATCH | `/api/v1/agencies/[id]` |
| DELETE | `/api/v1/agencies/[id]` |

### Company Information
*(SUPERUSER only for writes)*

| Method | Path |
|---|---|
| GET | `/api/v1/company-info` |
| PATCH | `/api/v1/company-info` |

### Audit Logs
*(SUPERUSER/ADMIN)*

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/audit-logs` | Most recent 500 |

### Tasks

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/tasks` | All tasks |
| POST | `/api/v1/tasks` | Create |
| PATCH | `/api/v1/tasks/[id]` | Full update (status, notes, completed_date, escalation_data) |
| DELETE | `/api/v1/tasks/[id]` | Delete |
| POST | `/api/v1/tasks/[id]/escalate` | 🔒 self-scoped — `createdByEmail`/`createdByName` on the generated follow-up task always come from the caller, not the request body |
| GET | `/api/v1/tasks/mine` | 🔒 self-scoped — always the authenticated caller's own tasks |

### Documents

| Method | Path |
|---|---|
| GET | `/api/v1/documents` |
| POST | `/api/v1/documents` |
| PATCH | `/api/v1/documents/[id]` |
| DELETE | `/api/v1/documents/[id]` |

### Time Logs (coordinator labor tracking)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/time-logs/mine` | 🔒 self-scoped |
| POST | `/api/v1/time-logs/clock-in` | 🔒 self-scoped — identity (id/name/email) always the caller |
| POST | `/api/v1/time-logs/clock-out` | Body: `{ logId }` |

### Referrals & Assignments

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/referrals` | |
| POST | `/api/v1/referrals` | Manual referral entry |
| GET | `/api/v1/assignments` | |
| POST | `/api/v1/assignments` | SUPERUSER/ADMIN/COORDINATOR |
| PATCH | `/api/v1/assignments/[id]` | Accept/decline/schedule — SUPERUSER/ADMIN/COORDINATOR/THERAPIST |
| DELETE | `/api/v1/assignments/[id]` | SUPERUSER/ADMIN/COORDINATOR |

### Visit Notes

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/visit-notes` | List (summary fields only) |
| POST | `/api/v1/visit-notes` | Create — a client-supplied `id` in the body is ignored to prevent accidentally overwriting an existing note |
| GET | `/api/v1/visit-notes/[id]` | Full detail |
| PATCH | `/api/v1/visit-notes/[id]` | Create-or-update semantics (same underlying `saveVisitNote`) |
| DELETE | `/api/v1/visit-notes/[id]` | SUPERUSER/ADMIN only |

### Invoices
*(SUPERUSER/ADMIN for writes)*

| Method | Path |
|---|---|
| GET | `/api/v1/invoices` |
| POST | `/api/v1/invoices` |
| PATCH | `/api/v1/invoices/[id]` |
| DELETE | `/api/v1/invoices/[id]` |

### Payroll, Reports, Calendar
*(read-only, SUPERUSER/ADMIN)*

| Method | Path |
|---|---|
| GET | `/api/v1/payroll` |
| GET | `/api/v1/reports` |
| GET | `/api/v1/calendar/visits` |
| GET | `/api/v1/calendar/weekly-close` |

### Deletion Requests (medical record deletion, two-admin approval)
*(SUPERUSER/ADMIN)*

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/deletion-requests` | |
| POST | `/api/v1/deletion-requests/[id]/approve` | Cannot approve your own request; cascades patient + visit note deletion |
| POST | `/api/v1/deletion-requests/[id]/reject` | |

### Notifications

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/notifications` | 🔒 self-scoped |
| POST | `/api/v1/notifications/[id]/read` | Mark one as read |
| POST | `/api/v1/notifications/mark-all-read` | 🔒 self-scoped |

---

## Deliberately excluded from REST

A few server-action functions have no REST endpoint, on purpose:

- `syncTherapistsToUsers`, `verifyCurrentUserPassword` (UserManagement) — internal/no REST semantics
- `saveMenuPermissions` (CompanyInformation) — admin config UI concern
- `getAgenciesForSelect`, `getUsersForSelect`, `getTherapistsForSchedule`, `getAgenciesForInvoice`, `getCompletedVisitsForInvoice`, `getVisitFormData` — UI dropdown/lookup helpers, redundant with the corresponding resource's own list endpoint (e.g. use `GET /api/v1/agencies` instead of `getAgenciesForSelect`)

## Implementation pattern

Every route handler follows the same shape — see `src/lib/api/response.ts`:

```ts
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const data = await someExistingServerAction();
    return apiSuccess(data);
  } catch (err) {
    return handleApiError(err); // maps "Unauthorized"/"Forbidden"/"Not found" to 401/403/404
  }
}
```

New endpoints should follow this pattern: import the existing action, don't duplicate its logic, and check whether it takes a caller-supplied identity parameter that needs to be overridden from `requireAuth()` instead (see the 🔒 self-scoped endpoints above for the pattern).
