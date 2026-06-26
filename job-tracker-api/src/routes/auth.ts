import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import authMiddleWare from "../middleware/auth.js";
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
  path: "/auth", // browser only attaches it to /auth/* routes, not every API call
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
  userName: z.string(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/register", async (req: Request, res: Response) => {
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
  const { email, userName, password } = parsed.data;
  const password_hash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at`,
      [email, userName, password_hash],
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
      },
    });
  } catch (error: any) {
    return res.status(401).json({ error: "server error" });
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
    `SELECT id, email, username AS "userName" FROM users WHERE id = $1`,
    [userID],
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.status(200).json({ user: result.rows[0] });
});

export default router;