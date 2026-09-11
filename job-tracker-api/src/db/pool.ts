import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

// Postgres DATE (type OID 1082) — hand it back as the plain "YYYY-MM-DD" string.
// pg's default parser builds a JS Date at the *server process's* local midnight,
// which reintroduces a time-of-day that `applied_at` never had (see migration
// 004). That fabricated time then shifts the day for any client in a different
// timezone than the server. Columns that are real instants (created_at etc.) are
// timestamptz and keep the default Date parsing.
pg.types.setTypeParser(1082, (value) => value);

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new pg.Pool({ connectionString: url });
