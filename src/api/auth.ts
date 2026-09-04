
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

// Auth Middleware
export const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = db.getUserById(decoded.userId);
  } catch (error) {
    req.user = undefined;
  }
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

authRouter.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
  
  db.saveOTP(phone, code);

  // TODO: Connect SMS Provider (Kavenegar, Ghasedak, etc.)
  console.log(`[SMS] Sending OTP ${code} to ${phone}`);

  res.json({ message: "OTP sent successfully (check console)" });
});

authRouter.post("/verify-otp", (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and code are required" });

  const isValid = db.verifyOTP(phone, code);
  if (!isValid) return res.status(400).json({ error: "Invalid or expired OTP" });

  let user = db.getUserByPhone(phone);
  if (!user) {
    user = db.createUser({ phone, name: "", activeSubscriptionId: null });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({ userId: user.id, token, user });
});

authRouter.get("/me", verifyAuthToken, requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default authRouter;
