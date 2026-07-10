import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import { pool } from "./db/pool.js";
import jobsRouter from "./routes/jobs.js";
import authRouter from "./routes/auth.js";
import authMiddleWare from "./middleware/auth.js";


dotenv.config();

const app = express();

// On Render (and most PaaS) requests arrive through a reverse proxy, so the
// real client IP lives in the `X-Forwarded-For` header — `req.ip` would
// otherwise be the proxy's IP, and every user would share one rate-limit
// counter. `trust proxy = 1` tells Express to trust exactly ONE proxy hop and
// read the client IP from that header. We only enable it in production; setting
// it to `true` blindly would let a client spoof `X-Forwarded-For` to dodge the
// limiter.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Only allow our own frontend(s) to call this API.
// - localhost for dev
// - an explicit prod origin via FRONTEND_ORIGIN (optional)
// - any Vercel deployment of this project (prod, branch, and preview URLs)
app.use(cookieParser());
const staticAllowed = [
  "http://localhost:3000",
  "https://landr.land",
  "https://www.landr.land",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean) as string[];
// Matches https://job-tracker-<anything>.vercel.app (preview/branch/prod URLs)
const vercelOriginPattern = /^https:\/\/job-tracker-[a-z0-9-]+\.vercel\.app$/;

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / non-browser requests (curl, server-to-server) where origin is undefined.
      if (!origin) return callback(null, true);
      if (staticAllowed.includes(origin) || vercelOriginPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    // Required for the httpOnly refresh cookie to be sent/stored cross-site.
    // Pairs with `credentials: "include"` on the frontend fetch.
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "landr api" });
});

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
    res
      .status(503)
      .json({ database: "down", error: "Could not reach database" });
  }
});

app.use("/jobs", authMiddleWare, jobsRouter);
app.use("/auth", authRouter);

// Export the app WITHOUT calling app.listen(), so tests can import it and
// send requests in-memory. Starting the server lives in index.ts.
export default app;
