# CLAUDE.md

**JobTracker** — Next.js 16 + React 19 frontend (`job-tracker-web/`) + Express 5 + Neon PostgreSQL backend (`job-tracker-api/`). See [workflows.md](workflows.md) for behavioral details.

---

## Critical Rules

1. All `"Jobs"` queries **must** be scoped by `req.user.id` (injected by `authMiddleware`).
2. **Never interpolate user input into SQL** — use `$1, $2, ...` parameterized queries. `"Jobs"` must be double-quoted.
3. POST/PATCH `/jobs` must filter body through `UPDATABLE_FIELDS`; return 400 if nothing valid remains.
4. Passwords are **bcrypt-hashed**. Never log/return plaintext. JWT secret from env only.
5. JWT required on all `/jobs` routes — attach `Authorization: Bearer <token>`. Never bypass `authMiddleware`.
6. Validate auth route bodies with **Zod**.
7. `API_BASE` lives in `src/lib/api.ts` — import it, don't redefine.
8. Server-side App Router fetches use `cache: "no-store"`.
9. No secrets in repo — read `DATABASE_URL`, `JWT_SECRET`, etc. from `process.env`.
10. Don't create DB tables in code — schema lives in Neon. Surface schema changes to user first.
11. `JobForm` edit mode: **PATCH** (not POST), seed `useState` from `initialJob`.
12. Keep `JobStatus` and `JOB_STATUS_OPTIONS` in sync.

---

## Remaining MVP TODOs (frontend)

- Wire up sign-in / sign-up `handleSubmit` → POST to API
- Persist JWT + attach `Authorization` header to `/jobs` fetches
- Route guard: redirect unauthenticated users from dashboard

---

## Data Model

`"Jobs"`: `company`, `role`, `title`, `status`, `notes`, `applied_at`, + URL/source/website/location fields.  
`users`: `id`, `email`, `password_hash`, `created_at`.  
`JobStatus`: `"applied" | "interview" | "interview 1" | "interview 2" | "interview 3" | "waiting" | "offer" | "rejected"`

---

## Commands

```bash
cd job-tracker-api && npm run dev   # :3001 (needs DATABASE_URL, JWT_SECRET in .env)
cd job-tracker-web && pnpm dev      # :3000 (reads NEXT_PUBLIC_API_URL)
```

---

## Trigger: `ship it`

When the user says **"ship it"**, run this exact sequence and stop if any step fails:

1. **Type-check API:** `cd job-tracker-api && npx tsc --noEmit`
2. **Type-check + lint web:** `cd job-tracker-web && npx tsc --noEmit && pnpm lint`
3. If both pass → ask the user for a commit message, then run:
   ```bash
   git add -p   # stage interactively, or use specific files the user confirms
   git commit -m "<message>"
   git push
   ```
4. If any step fails → report the errors and **do not commit or push**.
