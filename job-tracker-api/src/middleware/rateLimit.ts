/*
  Rate limiters (express-rate-limit)

  A rate limiter caps how many requests a single client (keyed by IP) may make
  in a time window. Over the limit → the request is rejected with 429 Too Many
  Requests and our route handler never runs.

  We define TWO limiters because different endpoints need different strictness:
  - authLimiter → protects /auth/login + /auth/register from password brute-force
  - demoLimiter → protects the expensive /auth/demo DB-reset from being spammed
*/

import rateLimit from "express-rate-limit";

/*
  Strict limiter for credential endpoints (login / register).

  windowMs      → the length of the counting window (15 minutes).
  limit         → max requests per IP per window. 10 is generous for a real
                  human (who mistypes a password a few times) but turns a
                  brute-force attack from "millions of guesses/min" into "10
                  guesses / 15 min".
  standardHeaders → send the modern `RateLimit-*` response headers so a client
                  can see how many attempts remain.
  legacyHeaders  → drop the deprecated `X-RateLimit-*` headers.
  message        → the JSON body returned on a 429. We match our app's
                  `{ error }` shape so the frontend handles it like any error.
*/
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

/*
  Limiter for the public demo endpoint.

  /auth/demo is cheap to CALL but expensive to SERVE (a full DB transaction:
  delete + 11 inserts + a bcrypt hash). That asymmetry makes it a prime DoS
  target, so we cap it tighter than a normal endpoint. A visitor only needs to
  click "Try the demo" once; 5 per 10 minutes is plenty for real use.
*/
export const demoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demo is warming up. Please try again shortly." },
});
