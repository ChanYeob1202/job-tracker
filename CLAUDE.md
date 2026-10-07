
# CLAUDE.md

**JobTracker** — Next.js 16 + React 19 frontend (`job-tracker-web/`) + Express 5 + Neon PostgreSQL backend (`job-tracker-api/`). See [workflows.md](workflows.md) for behavioral details.

Folder-specific rules:
- Backend: `job-tracker-api/CLAUDE.md`

## 학습 우선 (Learning-first)

- 기준: **"면접에서 내가 설명해야 하나?"** → Yes면 완성 코드/정답 주지 말고 guideline·힌트·질문·리뷰로 내가 직접 풀게 유도. (core logic, 알고리즘, 아키텍처 결정, **디버깅** 포함)
- No(grunt work: styling, boilerplate, config, 리팩터링, 문서)면 바로 처리.
- 애매하면 물어봐.

## communication
When I show you my code
Review it like a senior developer: point out problems and explain why they are problems.
Show the corrected version, kindly.

When I show you an error
Help me read the error message first.
Help me find the cause step by step: where to look (browser console, DevTools Network tab, server logs, database).
Then give the fix.
After it's solved, suggest a short entry for DEBUG_LOG.md: Error → Cause → Fix.

After you write code for me
Make sure I understand the important lines. Ask me to explain one part back if it's something new for me.
Sometimes ask me an interview-style question about it (example: "Why JWT instead of sessions?").
Suggest a small, clear commit message (example: Add bcrypt password hashing to signup route).

## Commands

```bash
cd job-tracker-api && npm run dev   # :3001 (needs DATABASE_URL, JWT_SECRET in .env)
cd job-tracker-web && pnpm dev      # :3000 (reads NEXT_PUBLIC_API_URL)
```

## Trigger: `ship it`

When the user says **"ship it"**, run this exact sequence and stop if any step fails:

1. **Type-check API:** `cd job-tracker-api && npx tsc --noEmit`
2. **Type-check + lint web:** `cd job-tracker-web && npx tsc --noEmit && pnpm lint`
3. If both pass → show `git status`, have the user confirm which files to stage, and ask for a commit message. Then run:
   ```bash
   git add <files>   # only the files the user confirmed (never `git add -p` — it is interactive and hangs/no-ops in Claude's shell)
   git commit -m "<message>"
   git push
   ```
   For hunk-level staging, the user runs `git add -p` in their own terminal and then tells Claude to continue from `git commit`.
4. If any step fails → report the errors and **do not commit or push**.
