-- Snapshot of the live Neon schema. Not executable history —
-- see migrations/ for the change log. Update this file after applying a migration.
-- Last verified against Neon: 2026-09-12 (through migration 005)

-- 1. users table (Auth)
CREATE TABLE "users" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now(),
    username      TEXT NOT NULL,
    job_title     TEXT
);

-- applied_at is DATE, not a timestamp: it comes from an <input type="date">,
-- so there is no time-of-day to store. The other four are real instants
-- produced by now(), so they stay TIMESTAMPTZ. See migrations 003, 004 and 005.
CREATE TABLE "Jobs" (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company           TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'applied',
    source            TEXT,
    notes             TEXT,
    applied_at        DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    role              TEXT,
    website           TEXT,
    location          TEXT,
    user_id           UUID,
    salary            TEXT,
    is_favorite       BOOLEAN NOT NULL DEFAULT false,
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_followed_up_at   TIMESTAMPTZ NULL, 

    CONSTRAINT "Jobs_user_id_fkey" FOREIGN KEY (user_id)
        REFERENCES public.users (id) ON DELETE CASCADE
);

-- Stamps status_changed_at whenever status actually changes. IS DISTINCT FROM
-- (not <>) so a NULL on either side still counts as a change. Added in 002.
CREATE OR REPLACE FUNCTION public.update_status_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.status_changed_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_status_change
    BEFORE UPDATE OF status ON public."Jobs"
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_status_changed();
