import { Router } from "express";
import "dotenv/config";
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
          .status(400)
          .json({ error: `Incorrect Email or Password. Try again` });
      }
    } else {
      return res
        .status(400)
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
  const { email, password, jobTitle, userName } = req.body;

  const signUpZodSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password should be longer than 8" }),
  });

  // TODO (zod): validate the register body with a Zod schema (frontend checks can be skipped with curl)
  //   Rule of thumb: the backend validates what it STORES.
  //   - email:    z.email()  (replaces deprecated z.string().email(); empty "" is already rejected, no .min needed)
  //   - password: z.string().min(8)
  //   - userName: z.string().trim().min(1).max(?)  <- pick a max; plain z.string() accepts ""
  //   - jobTitle: z.string().trim().min(1).max(?)  <- same
  //   - confirmPassword: NOT in the schema (frontend-only typo check, never stored)
  //   On failure: stop and return 400 (not 401/500) before touching the DB.

  /* 
    INSERT INTO table_name (column1, column2, column3)
VALUES (value1, value2, value3);
  */

  if (!email || !password || !jobTitle || !userName) {
    return res.status(401).json({ error: "missing fields" });
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
        return res.status(400).json({
          error: "Email is already registered",
        });
      }
    }
    console.error("Sign up failed. Error: ", error);
    return res
      .status(500)
      .json({
        error: "Something went wrong on our end. Please try again later",
      });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Invalid Authorization" });
  }
  try {
    const { sub, email, userName, jobTitle } = req.user;
    return res.status(200).json({ user: { sub, email, userName, jobTitle } });
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ error: "Something happend on our end try agian later." });
  }
});
