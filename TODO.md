# TODO / Ideas

comments across files. Keep inline `// TODO` only for notes tied to a specific line.

Status: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Features

- [x] Add **salary** field to jobs (form → type → API → table)
- [x] Add **color** to jobs (per-job or per-status color tagging)
- [ ] Add **screening interview** as a status / step
- [ ] Add **next step** field → then surface a "waiting" action on the stats bar

## UX / Interaction

- [ ] Clicking a stats card filters the list to that group
      (e.g. click "applied" → applied jobs; "waiting" → waiting jobs) — _Statsbar_
- [ ] Show "open" affordance on hover next to Company name — currently the only way
      into a job's detail is the Edit button. Consider replacing Edit with a proper
      **job detail page**. — _JobTable_
- [ ] Sign in: show a friendly **frontend** error, not the raw server error
      (❌ "Log in failed" → ✅ "Email and password do not match"). — _signin page_

## UI / Responsive

- [ ] Job table is hard to read on mobile — find a better format for phone users
      (e.g. card layout below a breakpoint). — _JobsBoard_
- [ ] Review JobTable redesign (Claude-built, interview prep): `avatarColor` hash in
      CompanyAvatar, why it's shared, `border-separate` card rows, why `STATUS_THEME`
      uses full literal class strings. — _JobTable / CompanyAvatar_
- [ ] Clean up `ui/jobtable-redesign` worktree + branch, `:3002`/`:3003` servers, and
      the `api-redesign`/`web-redesign` entries in `.claude/launch.json`.

## Backend / Data

