import express, { type Express } from "express";
import { pool } from "./db/pool.js";

/* 
Builds the Express app (JSON and cookie parsing, CORS) and mounts the routers.
*/

export const app: Express = express();

app.get("/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.status(200).json({ status: "successful" });
});

app.get("/jobs", (req, res) => {});
