import { Router } from "express";
import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

const router = Router();

/** Canonical string form returned by PostgreSQL `uuid` columns (with `node-pg`). */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function authorizedUserId(req: Request): string | undefined {
  const raw = req.user?.userID;
  if (raw === undefined || raw === null) return undefined;
  const s = typeof raw === "string" ? raw.trim() : String(raw).trim();
  if (!UUID_REGEX.test(s)) return undefined;
  return s.toLowerCase();
}

const UPDATABLE_FIELDS = [
  "company",
  "role",
  "source",
  "status",
  "notes",
  "website",
  "location", 
  "applied_at",
] as const;

router.get("/", async (req: Request, res: Response) => {
  const userId = authorizedUserId(req);
  if (userId === undefined) {
    return res.status(403).json({ error: "Invalid token payload" });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM "Jobs" WHERE user_id = $1',
      [userId]
    );
    const columns = result.fields.slice(1).map((f) => f.name);
    res.json({ columns, rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// job detail
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = authorizedUserId(req);
  if (userId === undefined) {
    return res.status(403).json({ error: "Invalid token payload" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM "Jobs" WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ row: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch a job with id" });
  }
});

// create a row
router.post("/", async (req: Request, res: Response) => {
  const userId = authorizedUserId(req);
  if (userId === undefined) {
    return res.status(403).json({ error: "Invalid token payload" });
  }

  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided" });
  }

  const keys = Object.keys(fields).filter(
    (k) => (UPDATABLE_FIELDS as readonly string[]).includes(k) && fields[k] !== ""
  );

  if (keys.length === 0) {
    return res.status(400).json({ error: "No valid fields" });
  }

  const quotedKeys = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 2}`).join(", ");
  const columns = `"user_id", ${quotedKeys}`;
  const values = [userId, ...keys.map((k) => fields[k])];

  try {
    const result = await pool.query(
      `INSERT INTO "Jobs" (${columns}) VALUES ($1, ${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json({ row: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create a job" });
  }
});


// update datas
router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = authorizedUserId(req);
  if (userId === undefined) {
    return res.status(403).json({ error: "Invalid token payload" });
  }

  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  const keys = Object.keys(fields).filter((k) =>
    (UPDATABLE_FIELDS as readonly string[]).includes(k)
  );

  if (keys.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  const values = keys.map((k) => fields[k]);
  values.push(id, userId);

  try {
    const result = await pool.query(
      `UPDATE "Jobs" SET ${setClauses} WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ row: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update job" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = authorizedUserId(req);
  if (userId === undefined) {
    return res.status(403).json({ error: "Invalid token payload" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM "Jobs" WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ row: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete job" });
  }
})




export default router;
