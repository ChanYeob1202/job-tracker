import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import authMiddleWare from "../middleware/auth.js";
import { authLimiter, demoLimiter } from "../middleware/rateLimit.js";
import { z } from "zod";

const router = Router();

/*
  [Refresh-token helpers]

  Two tokens, two jobs:
  - ACCESS token  → short-lived (15m), sent in the Authorization header on
    every request. If stolen, it's only useful for 15 minutes.
  - REFRESH token → long-lived (7d), stored in an httpOnly cookie. JS can't
    read httpOnly cookies, so an XSS script can't steal it. Its only purpose
    is to mint fresh access tokens via POST /auth/refresh.

  They are signed with DIFFERENT secrets so a leaked access token can never be
  replayed as a refresh token (and vice-versa).
*/
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const REFRESH_COOKIE = "refreshToken";
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, in milliseconds
const isProd = process.env.NODE_ENV === "production";

function signAccessToken(userID: string) {
  return jwt.sign({ userID }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken(userID: string) {
  return jwt.sign({ userID }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

// Cookie options must be IDENTICAL on set (login) and clear (logout), or the
// browser treats them as different cookies and clearCookie silently no-ops.
const refreshCookieOptions = {
  httpOnly: true, // JS (document.cookie) cannot read it → XSS-resistant
  secure: isProd, // HTTPS-only in prod; required when sameSite is "none"
  sameSite: isProd ? ("none" as const) : ("lax" as const), // prod = cross-site (Vercel ↔ Render)
  path: "/auth", // browser only attaches it to /auth/* routes, not every API call//
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    ...refreshCookieOptions,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

//email, password 를 어떠한형식으로 바꾸는것같은데 ?
const registerSchema = z.object({
  email: z.email(),
  // .min(1) matters: a bare z.string() accepts "" and would store an empty
  // username/job title, which the search page can't do anything with.
  userName: z.string().min(1, "User name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  password: z.string().min(8),
});


const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/*
  [Demo account]

  A public "Try the demo" button on the landing page hits POST /auth/demo.
  There is no password prompt — the endpoint logs the visitor into a shared
  demo user and returns the same access+refresh tokens a real login would, so
  every downstream feature (JWT middleware, /jobs scoping, /auth/refresh) works
  unchanged.

  Because the demo is public, anyone can edit/delete its rows. To keep the demo
  pristine for the next visitor, each call RESETS the demo user's jobs to a
  fixed seed set. `daysAgo` is turned into `now() - interval`, so the time-based
  stats ("This Week", response rate) always look alive instead of frozen.
*/
const DEMO_EMAIL = "demo@landr.app";
const DEMO_USERNAME = "Demo User";
// Seeded so the demo account behaves like a real one — the search page reads
// this to decide which listings to show, and would have nothing to query without it.
const DEMO_JOB_TITLE = "Software Engineer";

// The demo user needs *a* password hash (users.password_hash is NOT NULL), but
// nobody ever types it — /auth/demo skips the password check entirely. Hash it
// once per process and reuse the promise.
let demoPasswordHashPromise: Promise<string> | null = null;
function getDemoPasswordHash() {
  if (!demoPasswordHashPromise) {
    const secret = process.env.DEMO_PASSWORD ?? "demo-account-not-for-login";
    demoPasswordHashPromise = bcrypt.hash(secret, 12);
  }
  return demoPasswordHashPromise;
}

type DemoJob = {
  company: string;
  role: string;
  status: string;
  source: string;
  location: string;
  salary: string;
  website: string;
  notes: string | null;
  daysAgo: number; // applied_at = now() - daysAgo
};

const DEMO_JOBS: DemoJob[] = [
  { company: "OpenAI", role: "Software Engineer", status: "applied", source: "LinkedIn", location: "San Francisco, CA", salary: "$210k", website: "https://openai.com/careers", notes: "Referred by a friend on the applied team.", daysAgo: 1 },
  { company: "Supabase", role: "Full Stack Engineer", status: "applied", source: "Company site", location: "Remote", salary: "$170k", website: "https://supabase.com/careers", notes: null, daysAgo: 2 },
  { company: "Retool", role: "Frontend Engineer", status: "applied", source: "Wellfound", location: "New York, NY", salary: "$185k", website: "https://retool.com/careers", notes: "Take-home due if I hear back.", daysAgo: 4 },
  { company: "Ramp", role: "Software Engineer", status: "applied", source: "LinkedIn", location: "New York, NY", salary: "$195k", website: "https://ramp.com/careers", notes: null, daysAgo: 6 },
  { company: "Linear", role: "Product Engineer", status:"interview", source: "Referral", location: "Remote", salary: "$180k", website: "https://linear.app/careers", notes: "Recruiter said decision by end of week.", daysAgo: 9 },
  { company: "Vercel", role: "Full Stack Engineer", status: "interview", source: "Company site", location: "Remote", salary: "$190k", website: "https://vercel.com/careers", notes: "Phone screen went well — sent thank-you note.", daysAgo: 11 },
  { company: "Notion", role: "Frontend Engineer", status: "interview", source: "LinkedIn", location: "San Francisco, CA", salary: "$200k", website: "https://notion.so/careers", notes: "System design round scheduled for Thursday.", daysAgo: 15 },
  { company: "Airbnb", role: "Software Engineer", status: "applied", source: "Referral", location: "San Francisco, CA", salary: "$220k", website: "https://careers.airbnb.com", notes: "Final onsite — 4 rounds. Prep behavioral stories.", daysAgo: 18 },
  { company: "Stripe", role: "Backend Engineer", status: "offer", source: "Referral", location: "Seattle, WA", salary: "$235k", website: "https://stripe.com/jobs", notes: "Offer received! Negotiating start date.", daysAgo: 22 },
  { company: "Figma", role: "Frontend Engineer", status: "rejected", source: "LinkedIn", location: "San Francisco, CA", salary: "$205k", website: "https://figma.com/careers", notes: "Rejected after onsite — close call, keep in touch.", daysAgo: 26 },
  { company: "Datadog", role: "Software Engineer", status: "rejected", source: "Company site", location: "New York, NY", salary: "$190k", website: "https://careers.datadoghq.com", notes: null, daysAgo: 31 },
];

router.post("/demo", demoLimiter, async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Upsert the shared demo user. ON CONFLICT keeps the same id across visits,
    // so we don't accumulate orphaned demo users.
    const passwordHash = await getDemoPasswordHash();
    const userResult = await client.query(
      `INSERT INTO users (email, username, job_title, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET username = EXCLUDED.username, job_title = EXCLUDED.job_title
       RETURNING id, email, username AS "userName", job_title AS "jobTitle"`,
      [DEMO_EMAIL, DEMO_USERNAME, DEMO_JOB_TITLE, passwordHash],
    );
    const user = userResult.rows[0];

    // Reset to a pristine board for the next visitor.
    await client.query(`DELETE FROM "Jobs" WHERE user_id = $1`, [user.id]);

    for (const j of DEMO_JOBS) {
      await client.query(
        `INSERT INTO "Jobs"
           (user_id, company, role, status, source, location, salary, website, notes, applied_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now() - ($10 || ' days')::interval)`,
        [user.id, j.company, j.role, j.status, j.source, j.location, j.salary, j.website, j.notes, String(j.daysAgo)],
      );
    }

    await client.query("COMMIT");

    // Same token flow as a real login.
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      accessToken,
      user: { id: user.id, email: user.email, userName: user.userName, jobTitle: user.jobTitle },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /auth/demo failed:", error);
    return res.status(500).json({ error: "Failed to start demo" });
  } finally {
    client.release();
  }
});

router.post("/register", authLimiter, async (req: Request, res: Response) => {
  /*
    [parsed 가 뭐 하는지]
    1. req.body 는 사용자가 frontend 에서 보낸 raw 데이터.
       예: { email: "a@b.com", password: "12345678" }
       하지만 사용자가 뭘 보낼지 알 수 없음 — 빈값, 이상한 타입, 추가 필드 등.

    2. registerSchema.safeParse(req.body) 는
       "이 데이터가 위에서 만든 규칙(email 형식 + password 8자 이상)에 맞는가?"
       를 검사함. 데이터를 "바꾸는" 게 아니라 "검사"하는 거.

    3. 검사 결과(parsed)는 두 가지 모양 중 하나:

       성공 시: { success: true,  data:  { email, password } }
       실패 시: { success: false, error: ZodError }

       즉 parsed.success 라는 boolean 으로 통과 여부를 알 수 있고,
       통과했으면 parsed.data 에 검증된 깨끗한 값이 들어있음.

    4. safeParse vs parse 차이:
       - parse()     → 실패하면 throw (try/catch 필요)
       - safeParse() → 실패해도 throw 안 함, 대신 { success: false } 돌려줌
       여기선 if 문으로 깔끔하게 처리하려고 safePar\se 씀.
  */
  const parsed = registerSchema.safeParse(req.body);

  // 검사 실패: 사용자한테 400 (Bad Request) 와 어떤 필드가 틀렸는지 알려줌.
  // flatten().fieldErrors 는 ZodError 를 { email: [...], password: [...] } 모양으로 정리해줌.
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  // 검사 통과: parsed.data 에서 email, password 를 꺼냄.
  // 여기 도달했다는 건 이미 "email 은 이메일 형식, password 는 8자 이상" 이 보장된 상태.
  const { email, userName, jobTitle, password } = parsed.data;
  const password_hash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, job_title, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, username AS "userName", job_title AS "jobTitle", created_at`,
      [email, userName, jobTitle, password_hash],
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

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  // req takes decoded from middleware => req.user
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (!userResult.rows[0]) {
      return res.status(401).json({ error: "user doesn't exist" });
    }

    const user = userResult.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "email and password don't match" });
    }
    // Issue BOTH tokens on a successful login:
    const accessToken = signAccessToken(user.id); // returned in JSON → header auth
    const refreshToken = signRefreshToken(user.id); // stored in httpOnly cookie
    setRefreshCookie(res, refreshToken);

    // Only the access token goes in the body. The refresh token never touches
    // JS — it rides along automatically as a cookie on future /auth requests.
    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        userName: user.username,
        jobTitle: user.job_title,
      },
    });
  } catch (error: any) {
    console.error("POST /login failed:", error);
    return res.status(500).json({ error: "server error" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  // cookie-parser (app.use(cookieParser())) populated req.cookies for us.
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "no refresh token" });
  }

  try {
    // verify() both checks the signature/expiry AND returns the payload.
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as { userID: string };

    const accessToken = signAccessToken(decoded.userID);
    return res.status(200).json({ accessToken });
  } catch {
    // Expired or tampered refresh token → force a real re-login.
    return res.status(401).json({ error: "invalid refresh token" });
  }
});

/*
  POST /auth/logout

  Clearing the cookie is what actually revokes the long-lived session — without
  it, the refresh token stays valid for 7 days even after "logging out".
  clearCookie MUST receive the same options (path/sameSite/secure) used to set
  it, or the browser won't match and delete the cookie.
*/
router.post("/logout", async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  return res.status(200).json({ message: "logged out" });
});

router.get("/me", authMiddleWare, async (req: Request, res: Response) => {
  const userID = (req.user as { userID: string }).userID;
  const result = await pool.query(
    `SELECT id, email, username AS "userName", job_title AS "jobTitle" FROM users WHERE id = $1`,
    [userID],
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.status(200).json({ user: result.rows[0] });
});

export default router;