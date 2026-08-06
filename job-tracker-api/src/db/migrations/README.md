# migrations

Plain SQL, applied by hand in the Neon SQL editor. No migration tool yet — that's
deliberate at this size.

## Rules

1. **Append-only.** Numbered `NNN_description.sql`. Once a file is committed, never
   edit it — write a new one.
2. **Idempotent.** Use `IF NOT EXISTS` / `IF EXISTS` so re-running is safe.
3. **File first, DB second.** Never ALTER in the Neon console directly. Write the
   migration, commit it, then paste it into the editor.

After applying, update `../schema.sql` so it stays an accurate snapshot of the
current state.

## When to adopt a real tool

Bring in `node-pg-migrate` (raw SQL, no ORM) once any of these is true: a staging
branch exists, a second developer joins, or this folder passes ~10 files.
