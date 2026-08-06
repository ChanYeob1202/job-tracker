import { Router } from "express"
import type { Request, Response} from "express"
import { pool } from "../db/pool.js"
import dotenv from "dotenv";

dotenv.config();

const router = Router();
// https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${apiId}&app_key=${apiKey}7&what=software%20engineer&results_per_page=10


export default router;