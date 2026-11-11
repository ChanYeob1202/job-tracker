import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "User not found" });
  }
  let payload;

  try {
    // only the risky token work is guarded 
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey)
      return res
        .status(500)
        .json({
          error: "Something happend on our end, please try again later",
        });

        payload = jwt.verify(token,secretKey);

    if (payload && typeof payload === "object") {
        req.user = payload;
        req.user.token = token;
        req.user.userId = payload.sub
      } else return res.status(401).json({ error: "Invalid data format" });
    } catch (error) {
      return res.status(401).json({ error: "Invalid Request" });
    }
    next();
  }
