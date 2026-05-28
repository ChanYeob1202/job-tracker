import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import authMiddleWare from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  const password_hash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users ( email, password_hash ) VALUES ($1, $2) RETURNING id, email, created_at`,
      [email, password_hash],
    );
    return res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists " });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  // req takes decoded from middleware => req.user 
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(401).json({ error: parsed.error.flatten().fieldErrors });
  }
  const { email, password } = parsed.data;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (!userResult.rows[0]) {
      return res.status(401).json({ error: "user dosen't exist" });
    }

    const user = userResult.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res
        .status(401)
        .json({ error: "email and password dosen't match" });
    }

    const token = jwt.sign({ userID: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    return res.status(401).json({ error: "server error" });
  }
});


router.get("/me", authMiddleWare, async (req: Request, res: Response) => {
  const userID = (req.user as { userID: string }).userID;
  const result = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [userID]
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.status(200).json({ user: result.rows[0] });
})

export default router;
