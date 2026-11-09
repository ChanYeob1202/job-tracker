import { Router } from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter: Router = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: `Email and Password are required` });
  }
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
          jobTitle: loggedInUser.job_title
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
        const { sub, email, userName, jobTitle } = payload;
        return res
          .cookie("token", token, {
            httpOnly: true,
            sameSite: 'none',
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
  const { email, password, jobTitle, userName } = req.body

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
    if(error && typeof error === "object" && "code" in error){
      if(error.code === `23505`){
        return res.status(400).json({
          error: "Email is already registered"
        });
      }
    }
    console.error("Sign up failed. Error: ", error);
    return res.status(500).json({ error: "Something went wrong on our end. Please try again later"});
  }
});


authRouter.get("/me", requireAuth, async(req, res) => {
  if(!req.user)  {
    return res.status(401).json({ error: "Invalid Authorization"})
  } 
  try {
    const { sub, email, userName, jobTitle } = req.user;
    return res.status(200).json({ user: { sub, email, userName, jobTitle }})
  } catch (error: unknown){
    return res.status(500).json ({ error: "Something happend on our end try agian later."})
  }
})