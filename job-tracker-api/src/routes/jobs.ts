import { Router } from "express";
import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

const router = Router();

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

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM "Jobs"');
    const columns = result.fields.slice(1).map((f) => f.name);
    res.json({ columns, rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Fetch one job by id 
router.get("/:id", async (req:Request, res: Response)=> {
  const { id } = req.params; 

  try {
    const result = await pool.query(`SELECT * FROM "Jobs" WHERE id = $1`,[id]);
    if(result.rowCount === 0){
      return res.status(404).json({ error: "Job not found"});
    } 
    res.json({ row: result.rows[0]});
  } catch (error){
    console.error(error);
    res.status(500).json( { error: "Failed to fetch a job with id"})
  }
})

// create a row
router.post("/", async (req: Request, res: Response) => {
  const fields = req.body

  if (!fields || Object.keys(fields).length === 0){
    return res.status(400).json({ error: "No fields provided" });
  }

  const keys = Object.keys(fields).filter(
    (k) => (UPDATABLE_FIELDS as readonly string[]).includes(k) && fields[k] !== ""
  );

  if(keys.length === 0) {
    return res.status(400).json( { error: "No valid fields"} );
  }

  const columns = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const values = keys.map((k) => fields[k]);

  try {
    const result  = await pool.query(
      `INSERT INTO "Jobs" (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    )
    res.status(201).json( { row: result.rows[0]})
  } catch (e){
    console.error(e);
    res.status(500).json({ error: "Failed to create a job"})
  }
})


// update datas
router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
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
  values.push(id);
  
  
  try {
    const result = await pool.query(
      `UPDATE "Jobs" SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
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

  try {
    const result = await pool.query(
      `DELETE FROM "Jobs" WHERE id = $1 RETURNING *`,
      [id]
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
