# Backend rebuild: how to plan it (coaching plan)

## Context
Most of `job-tracker-api` was written by AI. On branch `learn/backend-rebuild`, `src/` is deleted (package.json and tsconfig are kept). The user wants to plan the rebuild the way a working engineer would before writing any code. **The user writes the plan.** Claude explains the method, asks questions and reviews. Claude does not pick the order or write the content.

## What a real engineer's pre-code plan contains (the user fills in each part)
1. **Requirements**: who uses the API and what they must be able to do (user stories), plus what is out of scope.
          

2. **Constraints**: the frontend already calls `/auth/demo`, `/auth/logout`, `/auth/me`, `/jobs` and `/jobs/:id` through `apiFetch`, so that contract has to keep working. About 6 real users are on `main`. Same Neon DB. Render deployment.
3. **Data model**: tables, columns and relationships (ERD).
4. **API contract**: for each endpoint, the method, path, request, response, status codes and whether auth is needed.
5. **Architecture**: layers (route → controller/service → DB), folder layout, where auth and validation happen.
6. **Risks and open questions**: things the user can't explain yet.
7. **Task breakdown + definition of done**: small, commit-sized tasks.

## Decided so far (by the user)
- Start with **Requirements**. Reason: tables designed before features are known end up missing columns.
- ✅ Requirements written: target user & problem, stories S1–S7, out-of-scope list. (Trash/undo scope still undecided.)
- Order for the rest: parts 2 → 7 in order. **Revised 2026-10-29: lighter version.** Finish part 4 (API contract) properly; keep parts 5-7 to about a page in total; then start building and update the plan as things are learned. *Confirm items* in the data model get checked in Neon when they are needed.
- ✅ **Scope decision: rebuild the backend only; keep the frontend as is for now.** The working frontend is the test tool for the new backend, and changing one side at a time means any bug points at what just changed. After the auth step, read `job-tracker-web/src/lib/api.ts` (token refresh) line by line until it can be explained out loud; rewrite it by hand only if it still can't be.
- ✅ Constraints written: protect real data (separate dev DB via `DATABASE_URL`), keep the frontend's paths and response shapes.

## Target user & problem (in the user's words)
**Who:** people actively looking for a job who want a tool that does job tracking and nothing else.
**Also:** visitors (potential users, recruiters) who want to try it without signing up (see S7).

**Problem with today's tools:**
- **Notion** does too many other things, so it's easy to lose focus.
- **Google Sheets** is too limited and too flat (often just a company name per row).

**What this app does:** helps users track and follow up on every application they've sent.

## User stories
- **S1 (dashboard):** As a job seeker, I want to see a dashboard with the number of applied, rejected and accepted applications, plus a list of my applications, so that I can stay on track.
- **S2 (account):** As a job seeker, I want to sign up and sign in so that I see only my own applications.
- **S3 (add):** As a job seeker, I want to add a job application so that it appears in my list and I can keep track of it.
- **S4 (update status):** As a job seeker, I want to update an application's status (e.g. applied → interview) so that my list and dashboard reflect where each application really stands.
- **S5 (delete):** As a job seeker, I want to delete an application I no longer want to track (e.g. a duplicate or one added by mistake) so that my list and dashboard stay clean and accurate. *A rejection is a status (S4), not a reason to delete.*
- **S6 (follow-up):** As a job seeker, I want the app to remind me when it's time to send a follow-up email to a company (using the contact email saved on that application) so that no application goes quiet without me reaching out. 
  - ~~**Trigger rule (v2):**~~ *(superseded by the FINAL rule below)* remind me when I haven't heard back 14 days after applying and I haven't followed up yet. As data: `status` is still "applied" AND today − `applied date` ≥ 14 days AND `last followed-up` is empty.
  - **Mark as followed up:** clicking it saves the current time in `last followed-up`, so the application drops out of the queue. (v1 rule had a bug: it reminded again on day 15.)
  - **Decision (2026-10-28): NO "no response" status.** `status` stays applied / interview / offer / rejected. The earlier ideas (7-day rule after a follow-up, the app auto-changing `status`, a 4th dashboard bucket) are **dropped**. Reason: the follow-up queue already catches silent applications, so a stored "no response" has no feature behind it.
  - **The queue is just a question asked of the table**, worked out when the list is requested. Nothing is updated in the background, so **no scheduled job and no "update on visit" step is needed.** (The earlier "check on visit" decision is now moot for statuses; the same idea still applies to demo cleanup in S7.)
  - **FINAL trigger rule (v4), decided by the user 2026-10-28: nudge once per status.** An application is in the follow-up queue when BOTH:
    1. **14 days have passed since `status_changed_at`**, and
    2. **it hasn't been followed up since that status change**: `last_followed_up_at` is empty, or older than `status_changed_at`.
  - Why it works with no new column: clicking "followed up" makes `last_followed_up_at` newer than `status_changed_at` → out of the queue. Changing the status makes `status_changed_at` newer again → the rule re-arms by itself, nothing to reset.
  - Example: applied 20 days ago, moved to interview 2 days ago → only 2 days since the status change → not in the queue yet.
  - **Rejected alternative (v3, repeat every 14 days):** silent applications would keep coming back forever. User's reason for B: "no point to persist over and over again." Revisit if users ask for repeat reminders (a small rule change, no migration).
  - **Only `applied` and `interview` applications can be in the queue** (user's decision). `rejected` and `offer` are never in it. Full rule: `status` is applied or interview, AND 14+ days since `status_changed_at`, AND not followed up since that status change.
  - The queue is **not stored anywhere**. It's a filter the server runs when the list is requested.
  - *Revisit if:* the app ever sends emails/notifications while the user is away. Then a scheduled job (cron) is needed.
- **S7 (demo):** As a visitor (a potential user or a recruiter), I want to try the app without signing up so that I can see what it does in seconds. *Second user type: visitors, not job seekers.*
  - **Rule:** demo data resets, so every visitor starts with the same clean sample applications, whatever the previous visitor did.
  - **Problem found:** one shared demo account plus a reset on every click means visitor B's click wipes visitor A's demo mid-session.
  - **Decision: one temporary demo user per click.** Clicking "Try demo" makes the server create a new user row itself (no email or password typed, marked as a demo user), copy the sample applications tagged with that new user ID, and sign the visitor in. This reuses the owner-ID "name tag" design, so no new system is needed.
  - **Cleanup:** the server can't detect a closed tab (nothing is sent), so "when they leave" won't work. Instead, demo users **expire by timer**: a demo user (and its applications) can be deleted once it's older than a set time, measured from when it was created. The user row needs a `created at` time for this.
  - *Considered:* "inactive" (time since last use). It works too, but the app would have to write a "last seen" time on every request. The timer is simpler.
  - **Cleanup trigger: the "Try demo" click itself.** Before creating the new demo user, the server deletes demo users older than the timer. No cron needed, the same "check on visit" idea as the no-response rule.
  - **Timer: 1 hour.** 15 minutes was rejected: a recruiter still exploring at minute 16 would have their demo deleted by another visitor's click. A few extra demo rows for an hour cost almost nothing.
- **Dashboard counts** are worked out from the rows on every load, never stored as a separate counter (one source of truth).

**Idea, scope not decided yet: trash / undo.** A deleted application goes to a "standby" area first, where the user can undo or delete it for good. (Engineers call this a *soft delete*.) Decide in or out of scope later.

**What an application holds (draft, user's list, from S3):**
job title · company name · salary · location · website · source · JD (job description) · applied date · job status · status change time · last follow-up date · contact email *(added from S6)*

**Real `"Jobs"` columns (checked in the Neon dashboard, 2026-10-28):**
`id` · `user_id` · `created_at` · `updated_at` · `applied_at` · `status_changed_at` · `last_followed_up_at` · `role` · `company` · `status` · `source` · `notes` · `website` · `location` · `salary` · `is_favorite`
- ✅ Already there: everything in the planned list except the two below. Note the real names: job title = `role`, applied date = `applied_at`, last follow-up = `last_followed_up_at`.
- ❌ **Missing: contact email** (needed by S6). New column → schema migration.
- ✅ **JD (job description) = the existing `notes` column. No new column.** Keep the name `notes`: the frontend sends `notes` in the request ([JobForm.tsx:113](job-tracker-web/src/app/components/jobs/JobForm.tsx:113)), reads `row.notes` in search, and labels it "Notes". Renaming would break the contract (same rule as `rows`/`row`). *Caveat: the old demo seed used `notes` for personal notes ("Recruiter said decision by end of week"), so users may have stored either kind.*
- ✅ **`is_favorite`: keep, for a future pin feature.** No story uses it now, so the new backend doesn't need to touch it. Removing it would be a risky migration for no gain.
- ✅ **`status` values: applied / interview / offer / rejected only** (user's decision). **Default for a new application: `applied`** (matches the frontend's create default, [job.ts:8](job-tracker-web/src/types/job.ts:8)). *To check in Neon: does the column already limit allowed values, and does it have a default?*
- ✅ **Conflict with S6 resolved: option A, drop "no response"** (see S6). Dashboard (S1) counts the 4 real statuses; "accepted" in S1 means `offer`.

**Set by the app, never typed by the user:**
- **Owner (user ID):** every application stores the ID of the user who owns it. The server fills it in from the login, never from the form.
- **Status change time (`status_changed_at`):** (1) when an application is **created**, the server sets it to `applied_at` (so a job applied to 20 days ago can show in the follow-up queue right away); (2) whenever the **status changes**, the server sets it to "now". It must never be empty, because the follow-up queue rule compares it, and an empty value (NULL) makes SQL silently leave the row out. *Plan: also mark it NOT NULL in the database as the last guard; check what the real table already enforces.*
- **Chain of guarantees (user spotted the gap, 2026-10-28):** `status_changed_at` starts as `applied_at`, so `applied_at` must never be empty either. The form starts blank and sends `applied_at: ""` if the user skips it ([JobForm.tsx:77,109](job-tracker-web/src/app/components/jobs/JobForm.tsx:77)), so the server must treat a blank date as **today**. *To confirm in part 4: how the old backend handled a blank date.*

**Decision: one shared table for everyone, each row tagged with its owner.** Not one database or table per user. Reason: adding a field later means updating 1 table, not 10,000.

**Open question (for Risks):** "status change time" keeps only the latest change. Will the Funnel feature need the full history (applied → interview → rejected)?

**Parked for the API contract step:** S1/S2 → `GET /jobs` returns only the signed-in user's jobs.

## Constraints (part 2)
- **Real users' data must not be lost or broken.** About 6 real users on `main` keep all their accounts and applications through the switch.
- **No data move needed, but schema changes are.** The new backend uses the same Neon DB, so the rows stay where they are. New fields (e.g. contact email) or new status values (e.g. "no response") need a *schema migration*: change the table, and existing rows get an empty or default value.
- ⚠️ **Risk:** local development currently points at the same Neon DB as production, so a buggy query written while learning could hit real users' data.
  - **Decision: a separate practice database with mock data for development.** The laptop's `.env` points only at the practice DB; the real DB is used only by the deployed app on Render. **Chosen: a Neon branch** (a full copy of the live DB). The copy has the **same table names** (`users`, `jobs`). The laptop and the live app are kept apart by *which address is in `DATABASE_URL`*, not by renaming tables.
  - **A Neon branch lives in Neon's cloud, not in git.** It's a snapshot of `main` from the moment it's created. New live signups don't appear in it; use "reset from parent" in the Neon dashboard to refresh it. Deleting `dev` only loses the practice copy. ✅ **Created 2026-10-30:** name `dev`, parent `production` (Neon's name for the live branch), option **"Branch schema only"** (beta). So `dev` has the `users` and `Jobs` tables but **no rows**: no real user data is on the laptop, and the mock data is added by the seed (task 8) or by the app itself. *To check: that the `trg_update_status_change` trigger came along.*
  - **A git branch does NOT protect data.** It separates code only. Safety comes from 2 settings on the laptop:
    1. `job-tracker-api/.env` → `DATABASE_URL` = Neon **dev** branch
    2. `job-tracker-web` → `NEXT_PUBLIC_API_URL` = **local** API (`localhost:3001`), not the live Render API. *Checked 2026-10-22: the web app has no `.env` file, so `src/lib/api.ts` falls back to `http://localhost:3001`. Already safe.*
  - Note for later: SQL placeholders (`$1`) protect against attackers (SQL injection), not against my own buggy queries. Both are needed.

- **The frontend's existing calls must keep working.** If the new backend renames a route (e.g. `/jobs` → `/applications`), the frontend gets **404 Not Found** and the user sees an empty or broken screen. Rule: keep these paths, or change frontend and backend together.

  Calls the frontend makes today (checked in `job-tracker-web/src`, 2026-10-22):

  | Method | Path | Called from |
  |---|---|---|
  | POST | `/auth/register` | `context/AuthContext.tsx` (sends email, userName, jobTitle, password) |
  | POST | `/auth/login` | `context/AuthContext.tsx` |
  | POST | `/auth/refresh` | `lib/api.ts` (uses the refresh cookie) |
  | GET | `/auth/me` | `context/AuthContext.tsx` |
  | POST | `/auth/demo` | `context/AuthContext.tsx` |
  | POST | `/auth/logout` | `context/AuthContext.tsx` |
  | GET | `/jobs` | `hooks/useJobs.ts` (reads `data.rows`) |
  | POST | `/jobs` | `app/components/jobs/JobForm.tsx` |
  | GET | `/jobs/:id` | `app/(protected)/jobs/[id]/edit/page.tsx` |
  | PATCH | `/jobs/:id` | `hooks/useJobs.ts` (reads `data.row`), `JobForm.tsx` |

  - Note: the frontend has **no DELETE call**, so S5 needs frontend work too.
- **Response shapes must match too, not just paths.** The frontend reads `data.rows` (list) and `data.row` (one job). If the backend sends `{ jobs: [...] }` instead, `data.rows` is `undefined` → `?? []` → the user sees an **empty list** with no error at all. Rule: keep the same keys, or change both sides together.

## Data model (part 3)
**Tables (draft):**
- `users`: info about each person (an account)
- `jobs`: each application's data (company name, status, applied date, ...). See the field list under S3.

**Relationship: one-to-many.** One user has many jobs, and each job has exactly one owner.
```
users  1 ────────< many  jobs
```
The owner column in `jobs` (the "name tag") is a **foreign key**: it holds the `id` of a row in `users`.

**Every table has its own `id`.** In `jobs` there are two ids:
- `id`: the job's own id, a **UUID** (long random string; can't be guessed like 101 → 102)
- `user_id`: the owner, a foreign key pointing to `users.id`

Seen in the old compiled code (`job-tracker-api/dist/routes/jobs.js`): the table is named **`"Jobs"`** (capital J, quoted), and every single-job query checks `WHERE id = $1 AND user_id = $2`, so you can only reach your own job. *Constraint: same DB, so keep the real table names.*

**`users` columns (draft, user's list):** id · email · username · password · job title · created at *(probably exists already; confirm in Neon)* · **`is_demo`** *(new column, default `false`)*
- **Decision: `is_demo`, default `false`, not `is_real`.** Reason: the 6 existing real users automatically get `false` (safe), and only the "Try demo" code ever sets `true`. With `is_real` defaulting to `false`, forgetting one migration step would make real users look deletable. Rule: name the flag after the rare, dangerous case and make the safe case the default.
- Demo cleanup rule: delete users where `is_demo = true` AND `created_at` is older than 1 hour (age alone would delete real users).
- **Decision (2026-10-29): Option A, no exceptions.** `email` and `password_hash` are required (never empty) and `email` is unique, for **every** user. For a demo user the *server* makes up a unique fake email (e.g. `demo-<random>@demo.invalid`) and a random password hash nobody knows. The visitor types nothing. Rejected B ("empty allowed when `is_demo`"): it adds an exception to a strict rule and nothing needs the empty value.
- **`username` and `job_title` are also required** (user's decision). For a demo user the server fills them with fixed values: username `Demo User`, and a sensible job title (the old demo used "Software Engineer"; confirm the exact value, since the frontend may show it).
- **Demo users still go through normal auth.** "Try demo" is the one public endpoint; it creates the user and returns a real token. `is_demo` is only a label for cleanup, never a way to skip `authMiddleware`.
- *Rejected:* asking visitors for email/name before the demo (CRM-style lead capture). It adds friction against S7 and means storing personal data for no feature. Revisit if you want to know who tries the demo.
- *Migration needed:* adding `is_demo` is a schema change to the shared database. Surface it to the user before running anything (project rule: schema lives in Neon).
- **No jobs column in `users`.** A user's jobs are found by looking in `jobs` for rows whose owner = that user's id. One cell holds one value, so cramming 50 jobs into one box would make them hard to search, update or count.
- *Note for the auth step:* never store the real password, only a scrambled version (a *hash*).

## Final data model (compiled from the user's decisions, 2026-10-29)
"Required" = the database refuses an empty value. *(confirm)* = not yet checked against the real table in Neon.

### users
| column | what it holds | required? | default | notes |
|---|---|---|---|---|
| `id` | the user's own id | yes | made automatically | `jobs.user_id` points here. *(confirm type; probably UUID)* |
| `email` | what the user logs in with | yes | none | **unique**. Demo user: server makes up `demo-<random>@demo.invalid` |
| `username` | display name | yes | none | Demo user: `Demo User` |
| `job_title` | the user's occupation | yes | none | Demo user: a stand-in title (old demo used "Software Engineer") |
| `password_hash` | scrambled password, never the real one | yes | none | Demo user: hash of a random string nobody knows |
| `created_at` | when the account was made | yes | now (set by the DB) | used by the 1-hour demo timer. *(confirm exists)* |
| `is_demo` | true for temporary demo users | yes | `false` | **NEW column (migration).** Existing real users automatically get `false` |

Demo cleanup: delete users where `is_demo = true` AND `created_at` is older than 1 hour. Runs at the start of each "Try demo" click.

### jobs  (real table name is `"Jobs"`, capital J, quoted)
| column | what it holds | required? | default | notes |
|---|---|---|---|---|
| `id` | the job's own id | yes | made automatically | UUID |
| `user_id` | the owner | yes | none | **foreign key** → `users.id`. Every query filters by it |
| `company` | company name | yes | none | form requires it |
| `role` | job title | yes | none | form requires it |
| `status` | where the application stands | yes | `applied` | only: applied / interview / offer / rejected. *(confirm DB limits the values)* |
| `applied_at` | day the user applied | yes | blank → today (server) | the form can send `""`, so the server must fix it |
| `status_changed_at` | last time `status` changed | yes | = `applied_at` on create | set to now whenever `status` changes |
| `last_followed_up_at` | when the user last clicked "followed up" | no | empty | empty until the first follow-up |
| `contact_email` | company contact for follow-ups | no | empty | **NEW column (migration)**, needed by S6 |
| `source` | where the job was found | no *(confirm)* | | |
| `location` | | no *(confirm)* | | |
| `salary` | | no *(confirm)* | | |
| `website` | | no *(confirm)* | | |
| `notes` | the JD / personal notes | no *(confirm)* | | keep the name: the frontend sends and reads `notes` |
| `is_favorite` | for a future pin feature | *(confirm)* | | exists already; untouched for now |
| `created_at` | when the row was made | yes | now (set by the DB) | |
| `updated_at` | when the row last changed | *(confirm)* | | exists already |

### Relationship
`users` 1 ──< many `jobs`: one user has many jobs, each job has exactly one owner (`jobs.user_id`).
- ❓ **Foreign key in the real database? (confirm in Neon)** Is `Jobs.user_id` an actual foreign key rule, or just a plain column?
- ✅ **Decision: option B. The database does NOT delete a user's jobs automatically; deleting a user who still owns jobs is refused.** The demo cleanup deletes the demo users' jobs first, then the users, together in one transaction (all-or-nothing). Reason: same "safe by default" idea as `is_demo`. A mistaken delete of a real user becomes an error instead of silently wiping their applications. Cost: the cleanup code must delete the jobs first.
  - ✅ **UPDATED 2026-10-30: decision B is dropped; keep the real `ON DELETE CASCADE`** (user's decision). Reason: the real foreign key already cascades, changing it is a migration on live data with 6 real users, and code can give the same safety: the demo cleanup only ever deletes users where `is_demo` is true, and no endpoint deletes real accounts. So the demo cleanup is just "delete demo users older than 1 hour"; their jobs go with them automatically. *Revisit if a "delete my account" feature is added.*

### Follow-up queue (not a table: a filter run on request)
`status` is applied or interview, AND 14+ days since `status_changed_at`, AND `last_followed_up_at` is empty or older than `status_changed_at`.

### Migrations needed (2 new columns; show to the user before running anything)
1. `users.is_demo` (default `false`)
2. `Jobs.contact_email` (optional)

## Confirmed from the old `schema.sql` + migrations (2026-10-29)
Source: `git show c9b8ea3:job-tracker-api/src/db/schema.sql` and `.../migrations/001-005`. The snapshot says "last verified against Neon 2026-09-12". The `Jobs` column list matches what the user pasted from Neon on 2026-10-28; the `users` columns were not rechecked. *Re-verify in Neon before running any migration.*

**What the real database has vs. what our data model says:**
| # | Real database | Our plan | Action to decide |
|---|---|---|---|
| 1 | Foreign key `Jobs_user_id_fkey` is **`ON DELETE CASCADE`** (deleting a user deletes their jobs) | Decision B: refuse | ✅ decided: keep cascade (no migration); decision B dropped |
| 2 | `users.job_title` is **nullable** | required | require it in the server (validation), or backfill + `NOT NULL` |
| 3 | `Jobs.role` is **nullable** | required | same |
| 4 | `Jobs.user_id` is **nullable** | required | check no rows are empty, then `NOT NULL` |
| 5 | `Jobs.applied_at` is a **DATE**, nullable, **no default** | required, blank → today | server fills in today; migration 002 used `COALESCE(applied_at, created_at)` as a backfill precedent |
| 6 | `users.created_at` is nullable (default `now()`) | required | `NOT NULL` is safe if no rows are empty |
| 7 | `status` has **no CHECK** on allowed values (only default `'applied'`) | only 4 values | server validation; a CHECK constraint is optional later |
| 8 | A **database trigger** sets `status_changed_at = now()` whenever `status` changes | server sets it | ✅ the server does NOT need to; the DB already does |
| 9 | `status_changed_at` default on insert is `now()` | = `applied_at` on create | the server must set it explicitly when inserting |
| 10 | `updated_at` has a default but **no trigger**, so it never changes after insert | updated on change | low priority; fix or ignore |
| 11 | `is_favorite` BOOLEAN NOT NULL default false | keep | ✅ nothing to do |

**Migration process from the old repo (reuse it):** plain SQL files numbered `NNN_description.sql`, applied by hand in the Neon SQL editor; append-only (never edit a committed file); idempotent (`IF NOT EXISTS`); **write the file first, commit it, then run it. Never ALTER in the Neon console directly.** After applying, update `schema.sql`.
- Next numbers: `006_users_is_demo.sql`, `007_jobs_contact_email.sql` (+ any constraint tightening above).

## API contract (part 4, in progress)
Rule for every signed-in endpoint: **the user id comes from the verified login token (`Authorization: Bearer ...`), never from the URL, query or body.** Anything the browser sends can be edited, so a plain `userId` would let someone change the number and read another user's data. For endpoints that target one job (`/jobs/:id`), the query checks BOTH the job id (from the URL) and the owner (from the token): `WHERE id = ... AND user_id = ...`.

**Two-token flow the frontend relies on** (from the old design; the frontend in `api.ts` is built around it):
- **Access token:** short-lived (old: 15 minutes), sent in the `Authorization` header on every request.
- **Refresh token:** long-lived (old: 7 days), kept in an httpOnly cookie and used only by `POST /auth/refresh` to get a new access token.
- Expired access token → backend answers `401` → frontend calls `/auth/refresh` once → if that works, the original request is replayed and the user notices nothing; if it fails, the user is logged out.
- Reason for two tokens: the user stays signed in without re-entering a password every 15 minutes.
- **Security reason:** the key that is easy to reach is short-lived, and the key that lives long is hard to reach. A stolen access token works for at most ~15 minutes. The refresh token sits in an httpOnly cookie that page JavaScript can't read.
- *Known tradeoff (risk list):* the frontend stores the access token in `localStorage` ([auth.ts:1-7](job-tracker-web/src/lib/auth.ts:1)), which any script on the page can read (XSS). Acceptable because the token expires in 15 minutes; revisit when `api.ts` / `auth.ts` get reviewed.

### GET /jobs  (S1, list)
- **Who can call it:** signed-in users only.
- **What goes in:** nothing in the body. The token is in the header.
- **What comes back:** `{ rows: [ ...the signed-in user's jobs... ] }` (the frontend reads `data.rows`).
- **Status codes:**
  - `200`: success, body has `rows`. A user with no jobs still gets `200` with `{ rows: [] }` (user's decision), not `404`: the list exists, it's just empty.
  - `401`: no token, or a bad or expired token (user's decision: the caller is "not known"). **The frontend depends on this exact code**: on a 401 it calls `POST /auth/refresh` once and replays the request ([api.ts:63-72](job-tracker-web/src/lib/api.ts:63)). Any other code for an expired token (e.g. 403) would skip the refresh.
  - `500`: the database failed *(proposed)*.
  - Note: the frontend treats any non-OK response as an empty list, so failures are silent on screen.

### GET /jobs/:id  (edit page loads one job)
- **Who can call it:** signed-in users only.
- **What goes in:** job id in the URL, token in the header.
- **What comes back:** `{ row: { ...the job... } }`. The edit page reads `data.row` ([page.tsx:31](job-tracker-web/src/app/(protected)/jobs/[id]/edit/page.tsx:31)).
- **Status codes:**
  - `200`: found, and it belongs to the signed-in user.
  - `401`: no, bad or expired token (frontend refreshes on this).
  - `404`: no job with that id **for this user**. A job that belongs to someone else gets the same `404` as one that doesn't exist, so a guesser learns nothing (a `403` would confirm "that id is real").
  - `500`: the database failed.
- Query shape: look up by job id AND owner (`id` and `user_id` together).
- Note: the edit page shows a spinner forever if there's no `row` in the answer, so a `404` currently looks like endless loading. *(frontend issue, noted for later)*

### DRAFT contracts (written by Claude from the old code `git show c9b8ea3:job-tracker-api/src/routes/...` and the frontend; **for the user to review**)
Common to all signed-in endpoints: `401` for a missing, bad or expired token (the old jobs routes used `403` for a bad token payload; the new backend uses `401` so the frontend's refresh works). Errors come back as `{ error: "message" }`. `user_id` always comes from the token, never the body.

**Notes on GET /jobs from the old code:** it also returned a `columns` key (the frontend never reads it, so it can be dropped) and sorted by `applied_at`, newest first (keep).

#### POST /jobs  (S3, add)
- **In:** body with `company`, `role` (both required), and optionally `status`, `source`, `applied_at`, `website`, `salary`, `location`, `notes`. Only an allow-list of keys is accepted: company, role, source, status, notes, website, salary, location, applied_at, last_followed_up_at. Blank `""` values are dropped.
- **Server fills in:** `id`, `user_id` (token), `status` = `applied` if missing, `applied_at` = today if blank, `status_changed_at` = `applied_at`, `created_at`.
- **Out:** `201` `{ row: {...} }`.
- **Codes:** `201`, `400` (no valid fields, missing company or role, or a status that isn't one of the 4), `401`, `500`. *Improvement over old code: it never checked company/role on the server.*

#### PATCH /jobs/:id  (S4 update status, S6 mark as followed up)
- **In:** job id in the URL; body with any of the same allow-listed keys.
- **Server does:** if `status` changed, set `status_changed_at` = now. Update `updated_at`. *(To confirm in Neon: the old handler never set `status_changed_at`, so a database trigger or default may do it.)*
- **Out:** `200` `{ row: {...} }` (the frontend merges `data.row` into its list).
- **Codes:** `200`, `400` (no valid fields, or a bad value), `401`, `404` (not found for this user), `500`.
- **"Mark as followed up" is not a new endpoint.** The frontend sends `PATCH /jobs/:id` with `last_followed_up_at` = the time of the click ([FollowUpCard.tsx:57](job-tracker-web/src/app/components/jobs/FollowUpCard.tsx:57)). *Open: trust the client's clock, or let the server set "now"?*

#### DELETE /jobs/:id  (S5)
- **In:** job id in the URL.
- **Out:** `200` `{ row: {...the deleted job...} }` (old behavior). **The frontend never calls this yet.**
- **Codes:** `200`, `401`, `404`, `500`.

#### POST /auth/register  (S2)
- **Public.** Rate limited.
- **In:** `{ email, userName, jobTitle, password }`. Checked: valid email, userName and jobTitle not empty, password 8+ characters.
- **Out:** `201` `{ user: {...} }`. (The frontend does not sign the user in after this.)
- **Codes:** `201`, `400` (`{ error: { field: [messages] } }`), `409` (email already exists), `500`.

#### POST /auth/login  (S2)
- **Public.** Rate limited. **In:** `{ email, password }`.
- **Out:** `200` `{ accessToken, user: { id, email, userName, jobTitle } }` and sets the refresh cookie.
- **Codes:** `200`, `400`, `401`, `500`.
- ✅ **Decision (user): one message for both login failures, `"Email or password is incorrect"`, status `401`.** The old code returned two different messages ("user doesn't exist" vs "email and password don't match"), which tells a guesser which emails have accounts.
- *Risk list:* `POST /auth/register` still answers `409` ("email already exists"), which also reveals that an email has an account. Accepted for now because the signup form needs to tell people.

#### POST /auth/refresh
- **Public, but needs the refresh cookie.** **Out:** `200` `{ accessToken }`. **Codes:** `200`, `401` (no cookie, or an invalid or expired one).

#### GET /auth/me
- **Signed in.** **Out:** `200` `{ user: { id, email, userName, jobTitle } }`. **Codes:** `200`, `401`, `404` (user no longer exists).

#### POST /auth/logout
- **Out:** `200` `{ message }` and clears the refresh cookie (must use the same cookie options it was set with).

#### POST /auth/demo  (S7)
- **Public.** Rate limited (old: 5 per 10 minutes). **In:** nothing.
- **Server does:** delete demo users older than 1 hour (and their jobs, in one transaction); create a new demo user (`is_demo = true`, made-up email, `Demo User`); copy the sample jobs; sign the visitor in.
- **Out:** `200` `{ accessToken, user: {...} }` and sets the refresh cookie (same shape as login).
- **Codes:** `200`, `429` (too many tries), `500`.

#### Follow-up queue and dashboard: no endpoints
The frontend calls no queue or stats endpoint. Both are worked out in the browser from the rows that `GET /jobs` returns, so the backend only has to return `status`, `status_changed_at`, `last_followed_up_at` and `applied_at` correctly.
- ⚠️ **Conflict with the plan's final follow-up rule:** the frontend's [followUp.ts](job-tracker-web/src/lib/followUp.ts) says a job is due **14 days after the LATER of `status_changed_at` and `last_followed_up_at`**, and shows it **5 days early**. That means it **repeats** every 14 days. Our plan's final rule (v4) was "nudge once per status".
- ✅ **Decision (user): keep the frontend's rule for now.** The backend is identical under both rules (it only returns the dates), so this blocks nothing. **Later frontend task:** change the queue to "once per status" (v4) after the backend works.

## Architecture (part 5, DRAFT by Claude for the user to review)
Kept small on purpose (the old project had no extra layers either): one folder per kind of job.

```
job-tracker-api/src/
├── index.ts            start the server (read PORT, listen)
├── app.ts              build the Express app: JSON + cookie parsing, CORS, mount the routers
├── db/
│   ├── pool.ts         ONE shared database connection pool (reads DATABASE_URL)
│   ├── schema.sql      snapshot of the live schema (update after each migration)
│   └── migrations/     006_..., 007_... plain SQL, file first, DB second
├── middleware/
│   ├── auth.ts         check the token on every protected route, put the user id on the request
│   └── rateLimit.ts    limit login / register / demo
└── routes/

    ├── auth.ts         /auth/*  (register, login, refresh, logout, me, demo)
    └── jobs.ts         /jobs/*  (list, one, create, update, delete)
```

**Life of a request** (e.g. `GET /jobs`): `app.ts` receives it → `middleware/auth.ts` checks the token (401 if bad) → `routes/jobs.ts` runs the query with the user id from the token → answers `{ rows }`.

**Where each rule lives:**
- Token check: `middleware/auth.ts` (jobs routes only; `/auth/login`, `register`, `refresh`, `demo` are public).
- Input checks: Zod in `routes/auth.ts`; an allow-list of fields in `routes/jobs.ts`.
- Every query uses `$1, $2` placeholders, and every job query includes the owner (`user_id` from the token).
- Secrets (`DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`) come from `process.env`, never the repo.

## Risks and open questions (part 6, DRAFT by Claude for the user to review)
**Before any code (do first):**
1. 🔴 **The laptop's `.env` still points at the live database.** Create the Neon `dev` branch and switch `DATABASE_URL` before writing a single query. (✅ Done 2026-10-30: `dev` created as schema-only and `.env` now points at it.)
2. 🔴 **Demo cleanup + `ON DELETE CASCADE`.** Since deleting a user deletes their jobs, a cleanup condition missing `is_demo = true` would wipe real users' jobs. The condition must be `is_demo = true AND created_at older than 1 hour`, tested on `dev` first.
3. 🟠 **The old `schema.sql` was verified on 2026-09-12.** Re-check the live tables in Neon before running any migration.

**Data:**
4. Several columns are nullable today (`job_title`, `role`, `user_id`, `applied_at`, `users.created_at`). Count the empty rows before making any of them `NOT NULL`.
5. `status_changed_at` defaults to `now()` on insert, and the trigger only fires on updates, so the server must set it to `applied_at` explicitly when creating a job.
6. `status` has no database CHECK, so only server validation keeps it to the 4 allowed values.
7. `updated_at` never changes after insert (no trigger). Low priority.
8. `notes` may hold the job description or personal notes; users may have used it either way.

**Frontend / contract:**
9. Keep the 10 paths, the `rows` / `row` keys, and `401` for expired tokens (the frontend refreshes on it).
10. The frontend never calls `DELETE /jobs/:id`, and the edit page shows a spinner forever on a 404. Both are frontend tasks for later.
11. The frontend's follow-up rule (repeats every 14 days, shown 5 days early) differs from the plan's once-per-status rule. Deferred.
12. `last_followed_up_at` is the client's clock. Revisit if it matters.

**Security:**
13. The access token lives in `localStorage` (readable by any script on the page). Accepted because it expires in 15 minutes.
14. `POST /auth/register` answers `409`, which reveals that an email has an account. Accepted for now.
15. Cookies: in production the refresh cookie needs `secure` and `sameSite: none` (frontend on Vercel, API on Render).

**Deploy:**
16. Render needs `JWT_SECRET`, `REFRESH_TOKEN_SECRET` and `NODE_ENV` set, and the build command needs `--include=dev`. Render's free plan also sleeps after ~15 minutes idle, so the first request after a pause is slow.

**Undecided features:** soft delete / trash-undo; status history for the Funnel feature; the pin feature (`is_favorite`).

## Tasks and definition of done (part 7, DRAFT by Claude for the user to review)
Working rules (from the rebuild path): the user researches the official docs and writes the code; Claude reviews. One small commit per task. Every bug gets an entry in `DEBUG_LOG.md`. After each task, answer one interview question out loud.

| # | Task | Done when |
|---|---|---|
| 0 | Create the Neon `dev` branch; put its connection string in `job-tracker-api/.env` | a harmless query shows the laptop is connected to `dev`, not `main`; the frontend still points at `localhost:3001` |
| 1 | `index.ts` + `app.ts`: a server with a `GET /health` route | `curl localhost:3001/health` answers 200 |
| 2 | `db/pool.ts`; `/health` also checks the database | `/health` shows the database answered |
| 3 | Migrations `006_users_is_demo.sql`, `007_jobs_contact_email.sql`, applied to `dev` only; update `schema.sql` | new columns exist on `dev`; files committed before they were run |
| 4 | `POST /auth/register` and `POST /auth/login` (bcrypt, JWT, Zod, one login error message) | the real frontend signup and login work against `dev` |
| 5 | `middleware/auth.ts` + `GET /auth/me` | a bad or missing token gets 401; a good one returns the user |
| 6 | `POST /auth/refresh` + `POST /auth/logout` (httpOnly cookie) | an expired access token refreshes silently in the frontend |
| 7 | Jobs, one at a time: `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `PATCH /jobs/:id`, `DELETE /jobs/:id`, each checking the owner | the frontend list, edit and add pages work; one user can't read another's job (404) |
| 8 | `POST /auth/demo` + the sample-jobs seed + the cleanup | two demos at once don't affect each other; cleanup deletes only old demo users |
| 9 | `rateLimit.ts` and a consistent error format | repeated login attempts get 429 |
| 10 | Tests for the auth and ownership rules | the tests pass, including "user A can't see user B's job" |
| 11 | Deploy: run the migrations on `main` (file first), set Render env vars, merge `learn/backend-rebuild`, smoke-test the live app | the 6 real users can still sign in and see their jobs |

**Definition of done for the whole rebuild:** I can explain every endpoint and the auth flow out loud, the branch is merged and deployed, the 6 real users' data is intact, and the resume bullets are updated.

### Progress checklist (tick as each task meets its "Done when")
- [x] Plan: requirements, constraints, data model, API contract, architecture, risks, tasks (drafted)
- [x] 0. Neon `dev` branch created; `.env` points at it; frontend on `localhost:3001` *(done 2026-10-30; still to prove in task 2 that the pool really connects to `dev`)*
- [x] 1. `index.ts` + `app.ts`; `GET /health` answers 200
- [ ] 2. `db/pool.ts`; `/health` checks the database
- [ ] 3. Migrations 006 + 007 on `dev` (file first); `schema.sql` updated
- [ ] 4. `POST /auth/register` + `POST /auth/login`
- [ ] 5. `middleware/auth.ts` + `GET /auth/me`
- [ ] 6. `POST /auth/refresh` + `POST /auth/logout`
- [ ] 7a. `GET /jobs`
- [ ] 7b. `GET /jobs/:id`
- [ ] 7c. `POST /jobs`
- [ ] 7d. `PATCH /jobs/:id`
- [ ] 7e. `DELETE /jobs/:id`
- [ ] 8. `POST /auth/demo` + seed + cleanup
- [ ] 9. `rateLimit.ts` + error format
- [ ] 10. Tests (including "user A can't see user B's job")
- [ ] 11. Deploy: migrations on `main`, Render env vars, merge, smoke test
- [ ] Resume bullets updated

## Out of scope (for this rebuild / MVP)
1. **Searching for job postings.** The app tracks jobs; it doesn't find them.
2. **AI JD fit check** (paste a JD and get a fit score, gaps and tips). Not MVP: the main goal is job tracking first, and the app can grow from there.

## Where the plan lives
A design doc in the repo, e.g. `docs/backend-design.md`, written by the user. Claude reviews it like a senior engineer would.

## Verification
- The user can explain every section out loud, interview-style.
- The API contract matches the frontend's real `apiFetch` calls (check by grepping `job-tracker-web/src`).


## introduction
