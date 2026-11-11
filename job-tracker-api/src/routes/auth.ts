import { Router } from "express";
import * as z from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter: Router = Router();

// Defined once, outside the route, so it isn't rebuilt on every request.
// z.object() is a function, it takes that object of rules and returns a schema, which is a checker.
// my own word -> z.object() takes object keys, and its values are actually rules, shcema. and it will be checking data types.

const signInZodSchema = z.object({
  // each value is a rule that describes what the filed must look like
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password should be longer than 8" }),
});

const signUpZodSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password should be longer than 8" }),
  userName: z.string().trim().min(1).max(10),
  jobTitle: z.string().trim().min(1).max(20),
});

authRouter.post("/login", async (req, res) => {
  // 1. Check the body. safeParse never throws: it returns { success, data } or { success, error }.
  const parsed = signInZodSchema.safeParse(req.body);
  // when failed -> { success: false, error: [Getter/Setter] }
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  // 3. From here on, use the checked values, not req.body.
  const { email, password } = parsed.data;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (result.rows.length > 0) {
      // ensures result found
      const loggedInUser = result.rows[0];
      const validUser = await bcrypt.compare(
        password,
        loggedInUser.password_hash,
      );
      if (validUser) {
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
          console.error("JWT_SECRET is not set");
          return res.status(500).json({
            error: "Something went wrong on our end. Please try again ",
          });
        }

        const payload = {
          sub: loggedInUser.id,
          userName: loggedInUser.username,
          email: loggedInUser.email,
          jobTitle: loggedInUser.job_title,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
        const { sub, email, userName, jobTitle } = payload;
        return res
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
            secure: true,
          })
          .json({
            user: { sub, email, userName, jobTitle },
          });
      } else {
        return res
          .status(401)
          .json({ error: `Incorrect Email or Password. Try again` });
      }
    } else {
      return res
        .status(401)
        .json({ error: `Incorrect Email or Password. Try again` });
    }
  } catch (error) {
    console.error("Log in failed:", error);
    return res.status(500).json({
      error: "Something went wrong on our end. Please try again later",
    });
  }
});

authRouter.post("/register", async (req, res) => {
  const parsed = signUpZodSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }

  const { email, password, jobTitle, userName } = parsed.data;
  if (!email || !password || !jobTitle || !userName) {
    return res.status(400).json({ error: "missing fields" });
  }

  const saltRounds = 12;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      `INSERT INTO users (email, password_hash, job_title, username) VALUES ($1, $2, $3, $4) RETURNING id`,
      [email, hashedPassword, jobTitle, userName],
    );
    return res.status(201).json({ message: "Registration successful" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === `23505`) {
        return res.status(409).json({
          error: "Email is already registered",
        });
      }
    }
    console.error("Sign up failed. Error: ", error);
    return res.status(500).json({
      error: "Something went wrong on our end. Please try again later",
    });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  /* 
  
  [ ] /me trusts the token, not the database. A deleted user, or a changed job title, still shows up for up to 15 minutes. The contract says /me returns 404 when the user no longer exists, and only a database lookup can do that. Pick one approach and be ready to explain why.
  */

  const userId = req?.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Invalid Authorization" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, username, job_title FROM users WHERE id = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Couldn't find a user" });
    }
    
    const row = result.rows[0];
    const { id:sub, email, username: userName, job_title: jobTitle } = row;
    return res.status(200).json({ user: { sub, email, userName, jobTitle } });
  } catch (error: unknown) {
    console.error("GET /me failed: ", error )
    return res
      .status(500)
      .json({ error: "Something happend on our end try agian later." });
  }
});