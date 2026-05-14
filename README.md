# JobTracker

A personal job-application tracker I'm building to manage my own job search — and to practice full-stack development with a modern stack.

The app is split into two services:

- **`job-tracker-web/`** — Next.js 16 (App Router) + React 19 + Tailwind v4 frontend
- **`job-tracker-api/`** — Express 5 + TypeScript backend, talking to a Neon PostgreSQL database

See each folder's README for setup and run instructions.

## What's built so far

- **CRUD for job applications** — create, view, edit, delete entries via a REST API (`/jobs` endpoints).
- **Dashboard** — server-rendered job list on the home page.
- **Inline editing** — edit any cell directly in the table (`EditableCell`).
- **Add / Edit forms** — dedicated pages at `/jobs/new` and `/jobs/[id]/edit`, sharing one `JobForm` component.
- **Status filter** — filter the table by application status (client-side).
- **Tracked fields** — company, role, title, status, notes, applied date, job URL, source, website, location.
- **Safe writes** — backend whitelists updatable fields and uses parameterized SQL queries.

## What I'm building right now

- **Auth** — the app is currently fully public (no login, no user scoping). Adding authentication so each user sees only their own jobs is the next major piece.
- Known smaller gaps I want to clean up next:
  - `/jobs` placeholder page (currently just renders text)
  - Edit form's submit flow (POST vs PATCH bug)
  - No DB migration file — the `Jobs` table was created manually in Neon

## Tech stack

| Layer    | Stack                                              |
|----------|----------------------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript  |
| Backend  | Express 5, TypeScript, `pg` (node-postgres)        |
| Database | PostgreSQL on Neon                                 |
| Tooling  | Turbopack, ESLint                                  |

## Project structure

```
JobTracker/
├── job-tracker-web/    # Next.js frontend
├── job-tracker-api/    # Express + Postgres backend
├── workflows.md        # Detailed FE/BE workflow notes
└── README.md           # (this file)
```

## Status

Work in progress — actively developing. Feedback welcome.
