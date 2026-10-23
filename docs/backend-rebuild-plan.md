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
- Order for the rest: go through parts 2 → 7 in order.
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
  - **Trigger rule (v2):** remind me when I haven't heard back 14 days after applying and I haven't followed up yet. As data: `status` is still "applied" AND today − `applied date` ≥ 14 days AND `last followed-up` is empty.
  - **Mark as followed up:** clicking it saves the current time in `last followed-up`, so the application drops out of the queue. (v1 rule had a bug: it reminded again on day 15.)
  - **No second reminder.** If I still haven't heard back 7 days after following up, the application counts as **"no response"**. As data: `status` is still "applied" AND today − `last followed-up` ≥ 7 days.
  - **Decision (A):** the app changes `status` to "no response" automatically. The dashboard shows a "no response" count (S1 now has 4 buckets: applied / rejected / accepted / no response).
  - If the company replies later, the user changes the status by hand (S4).
  - **Decision: check on visit, no scheduled job.** The server only acts when a request comes in, so when the user opens the app, it first updates *their* applications that match the 7-day rule and then returns the list. Reason: nobody is looking while they're away, so a late update costs nothing.
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

**Set by the app, never typed by the user:**
- **Owner (user ID):** every application stores the ID of the user who owns it. The server fills it in from the login, never from the form.
- **Status change time:** the server records "now" whenever the status changes.

**Decision: one shared table for everyone, each row tagged with its owner.** Not one database or table per user. Reason: adding a field later means updating 1 table, not 10,000.

**Open question (for Risks):** "status change time" keeps only the latest change. Will the Funnel feature need the full history (applied → interview → rejected)?

**Parked for the API contract step:** S1/S2 → `GET /jobs` returns only the signed-in user's jobs.

## Constraints (part 2)
- **Real users' data must not be lost or broken.** About 6 real users on `main` keep all their accounts and applications through the switch.
- **No data move needed, but schema changes are.** The new backend uses the same Neon DB, so the rows stay where they are. New fields (e.g. contact email) or new status values (e.g. "no response") need a *schema migration*: change the table, and existing rows get an empty or default value.
- ⚠️ **Risk:** local development currently points at the same Neon DB as production, so a buggy query written while learning could hit real users' data.
  - **Decision: a separate practice database with mock data for development.** The laptop's `.env` points only at the practice DB; the real DB is used only by the deployed app on Render. **Chosen: a Neon branch** (a full copy of the live DB). The copy has the **same table names** (`users`, `jobs`). The laptop and the live app are kept apart by *which address is in `DATABASE_URL`*, not by renaming tables.
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

## Out of scope (for this rebuild / MVP)
1. **Searching for job postings.** The app tracks jobs; it doesn't find them.
2. **AI JD fit check** (paste a JD and get a fit score, gaps and tips). Not MVP: the main goal is job tracking first, and the app can grow from there.

## Where the plan lives
A design doc in the repo, e.g. `docs/backend-design.md`, written by the user. Claude reviews it like a senior engineer would.

## Verification
- The user can explain every section out loud, interview-style.
- The API contract matches the frontend's real `apiFetch` calls (check by grepping `job-tracker-web/src`).
