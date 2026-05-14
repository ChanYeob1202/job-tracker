# job-tracker-api

Backend REST API for the JobTracker app. Built with Express and TypeScript, connected to a PostgreSQL database hosted on Neon.

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create a `.env` file** in this directory with your database URL:
```
DATABASE_URL=your_neon_connection_string_here
```

**3. Start the dev server**
```bash
npm run dev
```

The server runs on `http://localhost:3001` by default.

## Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start dev server with hot reload   |
| `npm run build` | Compile TypeScript to `dist/`      |
| `npm start`     | Run the compiled production build  |

## API Endpoints

Base URL: `http://localhost:3001`

| Method | Path         | Description              |
|--------|--------------|--------------------------|
| GET    | `/health`    | Health check             |
| GET    | `/db-health` | Database connection check|
| GET    | `/jobs`      | Get all job entries      |
| GET    | `/jobs/:id`  | Get a single job entry   |
| POST   | `/jobs`      | Create a new job entry   |
| PATCH  | `/jobs/:id`  | Update a job entry       |
| DELETE | `/jobs/:id`  | Delete a job entry       |

## Job Fields

| Field        | Type   | Description                  |
|--------------|--------|------------------------------|
| `company`    | string | Company name                 |
| `role`       | string | Job role / position          |
| `status`     | string | Application status           |
| `notes`      | string | Optional notes               |
| `applied_at` | string | Date applied (ISO format)    |

## File Structure

```
src/
├── index.ts        — Server setup, middleware, route mounting
├── db/
│   └── pool.ts     — PostgreSQL connection pool
└── routes/
    └── jobs.ts     — All /jobs endpoints
```
