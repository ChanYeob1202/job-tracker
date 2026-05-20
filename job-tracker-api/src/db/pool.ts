import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new pg.Pool({ connectionString: url });
