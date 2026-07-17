# IDEAS

날것의 아이디어 백로그. 여기서 골라서 `job-tracker-web/CLAUDE.md`의 `## next move`로 승격 → 구현.

형식: 한 줄로 적고, 필요하면 아래에 메모. 상태 태그 — `[raw]` 미검토 / `[deferred]` 나중에 / `[next]` 곧 착수.

---

## Features

- `[raw]` **Badge / ranking으로 지원 독려** — 계속 지원하도록 동기부여하는 게이미피케이션.
  - 방향 후보: streak(연속 지원일), 주간 지원 수 목표, 마일스톤 뱃지(첫 지원/10개/첫 인터뷰/첫 오퍼), response rate 기반 등급.
  - 데이터는 대부분 이미 있음(`applied_at`, `status`). Statsbar와 연결 가능.
  - 구직은 길고 지치는 과정이라 "동기 유지"가 핵심 문제 → 앱 차별점이 될 수 있음.

- `[next]` **Favorite 버튼** — job row에 별 토글. **DB는 이미 준비 완료** — `"Jobs".is_favorite BOOLEAN NOT NULL DEFAULT false` 적용됨(2026-07-16, 기존 43행 전부 false). 남은 건 API + FE.
  - 남은 작업: ① `jobs.ts`의 `UPDATABLE_FIELDS`에 `is_favorite` 추가 (없으면 PATCH가 필드를 버리고 `400 No valid fields`) ② `types/job.ts`에 `is_favorite: boolean` ③ JobTable에 별 렌더 (JobTable은 자체 하드코딩 COLUMNS라 컬럼이 저절로 안 뜸).
  - 주의: PATCH 핸들러엔 POST와 달리 `fields[k] !== ""` 필터가 없음 → FE에서 문자열 `"true"` 말고 실제 boolean 보낼 것.
  - 결정 포인트: **optimistic vs pessimistic UI** — 별을 먼저 칠하고 실패 시 롤백(즉각적, 롤백 코드 필요) vs 서버 응답 후 칠하기(단순, 느리게 느껴짐). 유저가 직접 구현 예정, Claude는 리뷰.

- `[next]` **Adzuna job search 연동** — 외부 job aggregator API로 여러 사이트 잡을 앱 안에서 검색 → 저장.
  - 타겟 = **미국/해외(영어권) 잡**. Adzuna는 한국 미지원(국가코드 `kr` 없음)이라 한국 잡용 아님. US/UK/CA 등은 커버리지·품질 충분(71k+ 회사, 월 ~178k 신규).
  - 구조: 프론트 검색창 → `GET /search` (Express 프록시) → `services/adzuna.ts`가 Adzuna 호출 + 응답을 Jobs 스키마로 매핑 → 결과 표시 → "저장" 시 기존 Jobs insert(`source="adzuna"`).
  - 키는 백엔드 전용(`ADZUNA_APP_ID`/`ADZUNA_APP_KEY`, `NEXT_PUBLIC_*` 금지). 매핑: `company.display_name→company`, `title→role`, `redirect_url→website`, `location.display_name→location`, `salary_min→salary`, `created→applied_at`.
  - 확장: 저장 키워드로 cron 자동 수집 → 새 매칭 잡 이메일 알림. LinkedIn 공식 API는 job search/notification 불가(파트너 전용)라 대안으로 채택.

## Account / Settings

- `[deferred]` **Delete account** — 유저가 본인 계정 삭제 (개인정보 삭제권 스토리 + 회원관리 CRUD 어필용). 배포/UX 다음 단계.
  - 결정 포인트(코드보다 이게 면접 핵심): **hard vs soft delete**(`users` DELETE vs `deleted_at` 마킹), **cascade**(user 삭제 시 그 사람의 `"Jobs"` 처리 — FK `ON DELETE CASCADE` vs 앱 레벨 트랜잭션), destructive action이라 **비밀번호 재확인** 권장.
  - 선행 확인: 현재 `"Jobs"` ↔ `users` FK 관계가 있는지부터 봐야 cascade 전략 확정 가능.
  - 학습 분담: core logic(cascade delete + 트랜잭션)은 유저가 직접 작성, Claude는 접근법 설명 + 리뷰.

## AI

- `[raw]` **URL → job form 자동 채우기** — 유저가 채용공고 URL만 붙여넣으면 AI가 페이지를 읽어 company/role/title/location/source 등 폼을 알아서 fill out.
  - 흐름 후보: URL 입력 → 백엔드가 페이지 fetch → LLM으로 구조화 추출(JSON) → 폼 프리필 → 유저가 확인/수정 후 저장.
  - 고려: 일부 사이트 로그인/JS 렌더링 필요(LinkedIn 등) → fetch 실패 케이스 처리. 추출 스키마는 Jobs 필드에 맞춤.

## UX

- `[deferred]` **Signup email-blur check** — 회원가입 시 email 입력 blur에서 async "이미 사용 중" 체크. `GET /auth/check-email` 필요. (post-MVP)

## Landing / Marketing

- `[deferred]` **Landing Feature 섹션 재작업** — 히어로는 정리 완료. Feature 섹션을 차별점(Statsbar/response rate) 중심으로 재구성. 기능 추가된 후로 미룸.
