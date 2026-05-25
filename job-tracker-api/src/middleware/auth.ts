import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/* 
extract token from request, and verify user and insert user_id into request
*/

export default function authMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "toekn dose not exist" });
  }

  // authHeader might be: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const parts = authHeader.split(" ");

  const token = parts.length === 2 ? parts[1] : undefined;

  if (!token) {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // Verify the token is valid and not tampered with
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    // req.user 주입
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
