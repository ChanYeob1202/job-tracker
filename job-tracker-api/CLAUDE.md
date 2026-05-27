# job-tracker-api (Backend)

Express 5 + Neon PostgreSQL. JWT auth + bcrypt. See root `CLAUDE.md` for project-wide rules and `workflows.md` for behavioral details.

---

## Critical Rules (Backend)

1. All `"Jobs"` queries **must** be scoped by `req.user.id` (injected by `authMiddleware`).
2. **Never interpolate user input into SQL** — use `$1, $2, ...` parameterized queries. `"Jobs"` must be double-quoted.
3. POST/PATCH `/jobs` must filter body through `UPDATABLE_FIELDS`; return 400 if nothing valid remains.
4. Passwords are **bcrypt-hashed**. Never log/return plaintext. JWT secret from env only.
5. JWT required on all `/jobs` routes — attach `Authorization: Bearer <token>`. Never bypass `authMiddleware`.
6. Validate auth route bodies with **Zod**.
7. No secrets in repo — read `DATABASE_URL`, `JWT_SECRET`, etc. from `process.env`.
8. Don't create DB tables in code — schema lives in Neon. Surface schema changes to user first.

---

## Commands

```bash
cd job-tracker-api && npm run dev   # :3001 (needs DATABASE_URL, JWT_SECRET in .env)
```

Type-check: `npx tsc --noEmit`
