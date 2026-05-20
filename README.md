# JobTracker

A personal job-application tracker I'm building to manage my own job search — and to practice full-stack development with a modern stack.

The app is split into two services:

- **`job-tracker-web/`** — Next.js 16 (App Router) + React 19 + Tailwind v4 frontend
- **`job-tracker-api/`** — Express 5 + TypeScript backend, talking to a Neon PostgreSQL database

See each folder's README for setup and run instructions.

## What's built so far

### Jobs (CRUD)
- REST API at `/jobs` — create, view, edit, delete entries.
- Server-rendered dashboard listing all jobs.
- **Inline editing** — edit any cell directly in the table (`EditableCell`), including a URL-type cell that renders as a clickable link.
- **Add / Edit forms** — dedicated pages at `/jobs/new` and `/jobs/[id]/edit`, sharing one `JobForm` component.
- **Status filter** — filter the table by application status (client-side).
- **Tracked fields** — company, role, title, status, notes, applied date, job URL, source, website, location.
- **Safe writes** — backend whitelists updatable fields and uses parameterized SQL queries.

### Authentication (backend)
- `POST /auth/register` — bcrypt-hashed passwords, zod-validated input, stored in a `users` table.
- `POST /auth/login` — issues a short-lived JWT (15 min).
- **`authMiddleware`** — verifies the Bearer token and injects `req.user` into downstream handlers.
- **Per-user data scoping** — every `/jobs` query is filtered by `user_id`, so users only see their own jobs.

## What I'm building right now

- **Frontend auth wiring** — `/auth/signin` and `/auth/signup` pages exist as UI shells; the next step is hooking up `handleSubmit`, persisting the JWT, and attaching it to subsequent `/jobs` requests.
- **Auth-aware navigation / route guarding** — redirecting unauthenticated users away from the dashboard.
- Smaller cleanups on the list:
  - `/jobs` placeholder page (currently just renders text)
  - Edit form's submit flow (POST vs PATCH bug)
  - No DB migration files yet — the `Jobs` and `users` tables were created manually in Neon.
  - JWT refresh flow (15 min token expiry is too short without one).

## Tech stack

| Layer    | Stack                                                |
|----------|------------------------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript    |
| Backend  | Express 5, TypeScript, `pg` (node-postgres), Zod     |
| Auth     | bcryptjs (password hashing), jsonwebtoken (JWT)      |
| Database | PostgreSQL on Neon                                   |
| Tooling  | Turbopack, ESLint                                    |

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
