import { Router } from "express"
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js"

const router = Router();

router.post("/register", async(req: Request, res: Response) => {
  const { email, password } = req.body;

  if(!email || !password){
    return res.status(400).json({ error: "Email and password are required"});
  }

  //hasing password
  const password_hash = await bcrypt.hash(password, 12);

  //store in DB
  try {
    const result = await pool.query(
      `INSERT INTO users ( email, password_hash ) VALUES ($1, $2) RETURNING id, email, created_at`,
      [ email, password_hash ]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err:any){
    // duplicated email
    if(err.code === "23505"){
      return res.status(409).json({ error: "Email already exists "});
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create user"})
  }
});

export default router;