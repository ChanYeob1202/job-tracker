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
JWT_SECRET=any_long_random_string
```

**3. Create the database tables** (run once, on a fresh Neon database):
```bash
psql "your_neon_connection_string_here" -f src/db/schema.sql
```
This applies [`src/db/schema.sql`](src/db/schema.sql) — the database blueprint — creating the empty `users` and `"Jobs"` tables. The tables start empty; data is added later through the API. Run this only once per database.

**4. Start the dev server**
```bash
npm run dev
```

The server runs on `http://localhost:3001` by default. Visit `http://localhost:3001/db-health` to confirm the database connection works.

## Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start dev server with hot reload   |
| `npm run build` | Compile TypeScript to `dist/`      |
| `npm start`     | Run the compiled production build  |

## API Endpoints

Base URL: `http://localhost:3001`

Endpoints marked 🔒 require an `Authorization: Bearer <token>` header (get a token from `/auth/login`).

| Method | Path             | Auth   | Description                  |
|--------|------------------|--------|------------------------------|
| GET    | `/health`        | Public | Server health check          |
| GET    | `/db-health`     | Public | Database connection check    |
| POST   | `/auth/register` | Public | Create a new user            |
| POST   | `/auth/login`    | Public | Get a JWT and user data      |
| GET    | `/auth/me`       | 🔒 JWT | Get the current logged-in user |
| GET    | `/jobs`          | 🔒 JWT | Get all job entries          |
| GET    | `/jobs/:id`      | 🔒 JWT | Get a single job entry       |
| POST   | `/jobs`          | 🔒 JWT | Create a new job entry       |
| PATCH  | `/jobs/:id`      | 🔒 JWT | Update a job entry           |
| DELETE | `/jobs/:id`      | 🔒 JWT | Delete a job entry           |

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
