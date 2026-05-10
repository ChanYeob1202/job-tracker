# job-tracker-web

Frontend for the JobTracker app. Built with Next.js 16, React 19, and Tailwind CSS.

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create a `.env.local` file** in this directory:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> If you skip this step, the app will default to `http://localhost:3001` automatically.

**3. Make sure the backend is running** — see `job-tracker-api/README.md`

**4. Start the dev server**
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

| Command        | Description                      |
|----------------|----------------------------------|
| `npm run dev`  | Start dev server with Turbopack  |
| `npm run build`| Build for production             |
| `npm start`    | Run the production build         |
| `npm run lint` | Run ESLint                       |

## Pages

| Route             | Description                              |
|-------------------|------------------------------------------|
| `/`               | Main dashboard — job list with filters   |
| `/jobs/new`       | Form to add a new job application        |
| `/jobs/[id]/edit` | Form to edit an existing job application |

## File Structure

```
src/
├── app/
│   ├── layout.tsx              — Root layout and navigation
│   ├── page.tsx                — Home page (job list)
│   └── jobs/
│       ├── new/page.tsx        — New job form
│       └── [id]/edit/page.tsx  — Edit job form
├── components/
│   ├── JobsBoard.tsx           — Filter + table container
│   ├── JobTable.tsx            — Inline-editable job table
│   ├── JobForm.tsx             — Shared form for create/edit
│   ├── JobFilterBar.tsx        — Status filter dropdown
│   └── JobPageNav.tsx          — Top navigation bar
├── lib/
│   └── api.ts                  — API base URL config
└── types/
    └── job.ts                  — Job type definitions
```
