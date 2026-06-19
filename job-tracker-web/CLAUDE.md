# job-tracker-web (Frontend)

Next.js 16 + React 19. See root `CLAUDE.md` for project-wide rules.

@AGENTS.md

---
## next move

I want to build by myself but I will need you as a guide. 

- make this app a production not just data dumb
- Stats bar: users will see total jobs number, number of jobs interviewing and waiting, total number of jobs offered, response rate including ( interviews, offers, and rejection ) and (only interview + offers), and total job applied this week.
- under stat bar: there will be action bar, searching, status filter, and add job button. 



---

## Commands

```bash
cd job-tracker-web && pnpm dev      # :3000 (reads NEXT_PUBLIC_API_URL)
```

Type-check + lint: `npx tsc --noEmit && pnpm lint`
