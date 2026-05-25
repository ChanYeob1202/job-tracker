# job-tracker-web (Frontend)

Next.js 16 + React 19. See root `CLAUDE.md` for project-wide rules.

@AGENTS.md

---

## Critical Rules (Frontend)

1. `API_BASE` lives in `src/lib/api.ts` — import it, don't redefine.
2. Server-side App Router fetches use `cache: "no-store"`.
3. `JobForm` edit mode: **PATCH** (not POST), seed `useState` from `initialJob`.
4. Keep `JobStatus` and `JOB_STATUS_OPTIONS` in sync.
5. Attach `Authorization: Bearer <token>` header to all `/jobs` fetches (JWT from auth flow).

---

## Remaining MVP TODOs

- Wire up sign-in / sign-up `handleSubmit` → POST to API
- Persist JWT + attach `Authorization` header to `/jobs` fetches
- Route guard: redirect unauthenticated users from dashboard

---

## Commands

```bash
cd job-tracker-web && pnpm dev      # :3000 (reads NEXT_PUBLIC_API_URL)
```

Type-check + lint: `npx tsc --noEmit && pnpm lint`
