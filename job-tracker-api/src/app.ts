import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db/pool.js";
import jobsRouter from './routes/jobs.js'
import authRouter from './routes/auth.js'
import authMiddleWare from "./middleware/auth.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (_req, res)=> {
  res.json({ message: "job tracker api"})
})

// simple health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


// verify Postgres (Neon) — runs SELECT 1
app.get("/db-health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    res.json({ database: "up", row: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(503).json({ database: "down", error: "Could not reach database" });
  }
});

app.use("/jobs", authMiddleWare, jobsRouter)
app.use("/auth", authRouter)

// Export the app WITHOUT calling app.listen(), so tests can import it and
// send requests in-memory. Starting the server lives in index.ts.
export default app;
