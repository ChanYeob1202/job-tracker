-- 004_applied_at_to_date.sql
-- Revert applied_at from TIMESTAMPTZ (set by 003) to DATE.
--
-- Why: applied_at comes from an <input type="date"> — the user picks a calendar
-- day and never enters a time. 003 converted it with `AT TIME ZONE 'UTC'`, which
-- pinned every row to UTC midnight. Browsers west of UTC then render that as the
-- previous evening, so the table showed the wrong day (e.g. 2026-09-04 → "9/3").
-- The time-of-day was never real information, so DATE drops it rather than
-- keeping a fabricated 00:00:00 that timezone conversion can corrupt.
--
-- created_at / updated_at / status_changed_at stay TIMESTAMPTZ: those are real
-- instants produced by now(), so a timezone is meaningful for them.
--
-- USING pins 'UTC' explicitly because a bare `applied_at::date` resolves against
-- the session TimeZone — verified that America/Los_Angeles yields the previous
-- day, so this must not be left to whatever session happens to apply the file.

ALTER TABLE "Jobs"
    ALTER COLUMN applied_at TYPE DATE
    USING (applied_at AT TIME ZONE 'UTC')::date;
