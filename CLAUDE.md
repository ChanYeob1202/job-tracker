# CLAUDE.md

**JobTracker** — Next.js 16 + React 19 frontend (`job-tracker-web/`) + Express 5 + Neon PostgreSQL backend (`job-tracker-api/`). See [workflows.md](workflows.md) for behavioral details.

Folder-specific rules:

- Frontend: `job-tracker-web/CLAUDE.md`
- Backend: `job-tracker-api/CLAUDE.md`

---

## Communication Style

- 한국어로 질문하면 한국어로답변, 영어로질문하면 영어로답변, 기술 용어는 영어 그대로 (useState, PATCH, JWT 등)
- 기본은 짧고 실용적으로.
- "자세히", "왜", "explain deeper" 라고 하면 그때만 깊게 설명
- 내가 틀린 방향이면 직접 지적, 우회 표현 금지
- Trade-off는 비교 질문일 때만 명시
- 답변 끝 요약, 6단계 설명 강제 없음

## 학습 우선 (Learning-first)

- 기준: **"면접에서 내가 설명해야 하나?"** → Yes면 완성 코드/정답 주지 말고 guideline·힌트·질문·리뷰로 내가 직접 풀게 유도. (core logic, 알고리즘, 아키텍처 결정, **디버깅** 포함)
- No(grunt work: styling, boilerplate, config, 리팩터링, 문서)면 바로 처리.
- 애매하면 물어봐.

## Data Model

`"Jobs"`: `company`, `role`, `title`, `status`, `notes`, `applied_at`, + URL/source/website/location fields.
`users`: `id`, `email`, `password_hash`, `created_at`.
`JobStatus`: `"applied" | "interview" | "interview 1" | "interview 2" | "interview 3" | "waiting" | "offer" | "rejected"`

## Commands

```bash
cd job-tracker-api && npm run dev   # :3001 (needs DATABASE_URL, JWT_SECRET in .env)
cd job-tracker-web && pnpm dev      # :3000 (reads NEXT_PUBLIC_API_URL)
```

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
