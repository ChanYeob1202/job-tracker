import express, { type Express } from "express";
import cors from 'cors';
import "dotenv/config";
import { pool } from "./db/pool.js";
import { authRouter } from "./routes/auth.js";

export const app: Express = express();
const allowedUrl = process.env.ALLOWED_URL?.split(',')

const corsOptions = {
  origin: allowedUrl,
  credentials: true, 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: [ 'Content-Type', 'Authorization'],
}
// setting CORS in app.ts where setting apps, and listeing all the requests here. index only decalre the port.
app.use(cors(corsOptions));

app.get("/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.status(200).json({ status: "successful" });
});

app.use("/auth", authRouter)
