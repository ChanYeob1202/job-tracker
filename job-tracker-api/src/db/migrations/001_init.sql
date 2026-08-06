-- 001_init.sql
-- Baseline: reflects the live Neon schema as of 2026-07-26.
-- The DB already existed before migrations were introduced, so this file is
-- written to be a no-op against it (IF NOT EXISTS everywhere). Running it on a
-- fresh database reproduces the same schema.

CREATE TABLE IF NOT EXISTS "users" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    username      TEXT NOT NULL,
    job_title     TEXT
);

CREATE TABLE IF NOT EXISTS "Jobs" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'applied',
    source      TEXT,
    notes       TEXT,
    applied_at  TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now(),
    role        TEXT,
    website     TEXT,
    location    TEXT,
    user_id     UUID,
    salary      TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Jobs_user_id_fkey" FOREIGN KEY (user_id)
        REFERENCES public.users (id) ON DELETE CASCADE
);
