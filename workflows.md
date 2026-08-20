# JobTracker Workflows

This document describes the current frontend / backend workflow of the JobTracker app.

- **Backend**: `job-tracker-api` (Express + TypeScript + PostgreSQL/Neon)
- **Frontend**: `job-tracker-web` (Next.js 16 App Router + React 19 + Tailwind v4)
- **Auth**: not implemented yet — every endpoint and page is public

---

## 1. Backend Workflow (`job-tracker-api`)

### 1.1 Tech Stack
- Express 5 + TypeScript
- PostgreSQL (Neon) via the `pg` Pool
- CORS fully open, `express.json()` body parser
- Zod is installed but not used yet
- `dotenv` loads `.env` at startup

### 1.2 File Structure
```
job-tracker-api/
├── src/
│   ├── index.ts          ← Express bootstrap, middleware, route mounting
│   ├── db/pool.ts        ← pg.Pool (uses DATABASE_URL)
│   └── routes/jobs.ts    ← /jobs CRUD router
├── .env                  ← DATABASE_URL
└── package.json
```

### 1.3 Server Bootstrap
[src/index.ts](job-tracker-api/src/index.ts)
1. Registers `cors()` + `express.json()` middleware
2. Registers health-check endpoints: `GET /`, `GET /health`, `GET /db-health` (the last runs `SELECT 1` against Neon)
3. `app.use("/jobs", jobsRouter)` — mounts the jobs router
4. Listens on `process.env.PORT` (defaults to 3001)

### 1.4 Database
- Connection: [src/db/pool.ts](job-tracker-api/src/db/pool.ts) — throws if `DATABASE_URL` is missing
- Table: `"Jobs"` (capitalized, so it must be quoted in SQL)
- Updatable columns: `company`, `role`, `title`, `status`, `notes`, `applied_at`
- `id` is the auto-increment primary key
- ⚠ There is no migration / schema file in the repo — the table was created manually in Neon

### 1.5 API Endpoints
All defined in [src/routes/jobs.ts](job-tracker-api/src/routes/jobs.ts).

| Method | Path | Behavior | Response |
|--------|------|----------|----------|
| GET    | `/jobs`     | Fetch all rows                          | `{ columns, rows }` |
| GET    | `/jobs/:id` | Fetch one row                           | `{ row }` / 404 |
| POST   | `/jobs`     | Create (only `UPDATABLE_FIELDS` allowed)| 201 `{ row }` / 400 |
| PATCH  | `/jobs/:id` | Partial update                          | 200 `{ row }` / 404 |
| DELETE | `/jobs/:id` | Delete (returns the deleted row)        | 200 `{ row }` / 404 |

POST and PATCH both build parameterized queries (`$1, $2, ...`) to prevent SQL injection.
Unknown fields are filtered out via the `UPDATABLE_FIELDS` whitelist; if nothing valid remains, a 400 is returned.

### 1.6 Backend Request Lifecycle
```
Client request
   ↓
CORS / JSON body parser
   ↓
/jobs router match
   ↓
Whitelist field check (UPDATABLE_FIELDS)
   ↓
Build parameterized SQL
   ↓
pool.query() → Neon Postgres
   ↓
JSON response: { row(s) }
```

---

## 2. Frontend Workflow (`job-tracker-web`)

### 2.1 Tech Stack
- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- No state-management library — `useState` + server-component fetching
- HTTP via the native `fetch()` API directly

### 2.2 File Structure
```
job-tracker-web/src/
├── app/
│   ├── layout.tsx                    ← Root layout + JobPageNav
│   ├── page.tsx                      ← Home — jobs list (server-side fetch)
│   ├── jobs/
│   │   ├── page.tsx                  ← Placeholder (just renders "this is job")
│   │   ├── new/page.tsx              ← New job form
│   │   └── [id]/edit/page.tsx        ← Edit job form (server prefetch)
│   └── components/
│       ├── JobsBoard.tsx             ← Filter + table container (client)
│       ├── JobTable.tsx              ← Inline-editable table (client)
│       ├── EditableCell.tsx          ← Per-cell editor component
│       ├── JobForm.tsx               ← Shared form for create/edit
│       ├── JobFilterBar.tsx          ← Status filter UI
│       ├── JobPageNav.tsx            ← Top nav
│       └── ui/{ActionButton,AddJobButton}.tsx
├── lib/api.ts                        ← API_BASE resolution
└── types/job.ts                      ← Job, JobStatus, JOB_STATUS_OPTIONS
```

### 2.3 API Base Configuration
[src/lib/api.ts](job-tracker-web/src/lib/api.ts)
```
API_BASE = NEXT_PUBLIC_API_URL ?? API_URL ?? "http://localhost:3001"
```
⚠ `JobTable.tsx` defines its own local `API_BASE` (only reads `NEXT_PUBLIC_API_URL`) instead of importing from `lib/api.ts`. Should be unified.

### 2.4 Page Roles
| Route | File | Kind | What it does |
|-------|------|------|--------------|
| `/`               | [src/app/page.tsx](job-tracker-web/src/app/page.tsx)                   | Server | Calls `GET /jobs`, renders `<JobsBoard initialRows>` |
| `/jobs`           | [src/app/jobs/page.tsx](job-tracker-web/src/app/jobs/page.tsx)         | Server | Placeholder only (`"this is job"`) |
| `/jobs/new`       | [src/app/jobs/new/page.tsx](job-tracker-web/src/app/jobs/new/page.tsx) | Server | Renders an empty `<JobForm>` |
| `/jobs/[id]/edit` | [src/app/jobs/[id]/edit/page.tsx](job-tracker-web/src/app/jobs/[id]/edit/page.tsx) | Server | Calls `GET /jobs/:id`, renders `<JobForm initialJob>` |

All server-side fetches use `cache: "no-store"` so data is always fresh.

---

## 3. End-to-End Flows (Frontend ↔ Backend)

### 3.1 List jobs
```
User visits "/"
   │
   ▼
[FE] app/page.tsx (server component)
       fetch(`${API_BASE}/jobs`, { cache: "no-store" })
   │
   ▼
[BE] GET /jobs  →  SELECT * FROM "Jobs"
   │
   ▼
[FE] <JobsBoard initialRows={rows}>
        ├─ <JobFilterBar>  : status filter useState
        └─ <JobTable>      : useMemo-filtered rows
```

### 3.2 Create a job
```
"Add Job" clicked → router.push("/jobs/new")
   │
   ▼
[FE] JobForm input → handleSubmit
       POST `${API_BASE}/jobs`  body: { company, role, status, applied_at, notes }
   │
   ▼
[BE] POST /jobs
       1) Whitelist check (UPDATABLE_FIELDS)
       2) INSERT INTO "Jobs" (...) VALUES (...) RETURNING *
   │
   ▼
[FE] Receives 201
   ⚠ After success, no navigation or list refresh — the user has to go back manually
   ⚠ The "empty fields" guard calls alert() but does NOT return, so submission still proceeds
```

### 3.3 Inline edit (table cell)
```
[FE] EditableCell click → input → blur/Enter
       JobTable.updateField(id, field, value)
       PATCH `${API_BASE}/jobs/${id}`  body: { [field]: value }
   │
   ▼
[BE] PATCH /jobs/:id
       UPDATE "Jobs" SET ${field}=$1 WHERE id=$2 RETURNING *
   │
   ▼
[FE] setRows(...) — local state updated immediately (optimistic-ish)
```

### 3.4 Edit page
```
Green edit button → router.push(`/jobs/${id}/edit`)
   │
   ▼
[FE-Server] GET /jobs/:id prefetch → <JobForm initialJob={row}>
   │
   ▼
[FE] User edits fields, clicks "Add"
   ⚠ Bug: JobForm.handleSubmit always POSTs, so editing creates a NEW row instead of updating
   ⚠ Bug: in edit mode, inputs bind `value` to `initialJob.*` directly instead of seeding state,
        so typing into Status / Applied date / Notes does not visibly update them
   ⚠ TODO: when initialJob is present, branch to PATCH /jobs/:id and seed useState from initialJob
```

### 3.5 Delete a job
```
[FE] JobTable red delete button → deleteField(id)
       DELETE `${API_BASE}/jobs/${id}`
   │
   ▼
[BE] DELETE FROM "Jobs" WHERE id=$1 RETURNING *
   │
   ▼
[FE] setRows(prev => prev.filter(r => r.id !== id))
```

### 3.6 Status filtering (frontend only)
```
JobFilterBar select changes
   ↓
JobsBoard.statusFilter useState updated
   ↓
useMemo re-filters initialRows
   ↓
JobTable re-renders
(no server call)
```

---

## 4. Data Model

[src/types/job.ts](job-tracker-web/src/types/job.ts)
```ts
type JobStatus =
  | "applied" | "interview" | "offer" | "rejected";   // all interview rounds collapse into "interview"

interface Job {
  id: number;
  company: string;
  title: string;
  status: JobStatus;
  role: string;
  notes: string | null;
  applied_at: string;   // ISO date
}
```

The columns of the backend `"Jobs"` table are inferred to be `UPDATABLE_FIELDS` + `id` (no migration file in the repo).

⚠ Inconsistencies to be aware of:
- `JOB_STATUS_OPTIONS` in `types/job.ts` does NOT include `"interview"` or `"offer"`, even though those are valid `JobStatus` values. So a row with `status: "offer"` in the DB cannot be picked from the dropdown after editing.
- The `Job` type has a `title` field, but no UI or API path reads/writes it; only `role` is used in the form and table.

---

## 5. Known Gaps / TODO

1. **No auth** — every endpoint is public, no per-user isolation.
<!-- 2. **Edit form bug** — `JobForm` calls POST in edit mode → creates a new row instead of updating. -->
<!-- 3. **Edit form input binding bug** — in edit mode, status / date / notes inputs read from `initialJob` instead of state, so user input doesn't show. -->
<!-- 4. **Submit guard bug** — empty company/role calls `alert()` but doesn't `return`; the request still fires. -->
<!-- 5. **Post-create UX** — after a successful POST, no navigation back or list refresh. -->
<!-- 6. **Error handling** — frontend only does `console.error` + `alert`; backend returns generic 500s with no error codes.
7. **No Zod validation** — backend input validation is just whitelist + empty check. -->
<!-- 8. **`/jobs/page.tsx`** is a leftover placeholder (the real list lives at `/`) — should be removed or repurposed. -->
<!-- 9. **No cache strategy** — every fetch is `no-store`, and inline edits cause the whole table to re-render. -->
<!-- 10. **Duplicated `API_BASE`** — `JobTable.tsx` defines its own instead of importing from `lib/api.ts`. -->
11. **`JobStatus` vs `JOB_STATUS_OPTIONS` mismatch** — `"interview"` and `"offer"` are valid statuses but missing from the dropdown options.
12. **Unused `title` field** — present in the `Job` type but never used by the UI.
13. **No DB migration file** — the `"Jobs"` schema only exists in Neon; cloning the repo doesn't reproduce it.
