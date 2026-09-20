declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { userRepository } from '../repositories/userRepository.js';
import { jwtService } from '../security/jwtService.js';
import { otpService } from '../security/otpService.js';
import { smsService } from '../services/smsService.js';
import { passwordService } from '../security/passwordService.js';
import { rateLimiters } from '../security/rateLimiter.js';
import { mockGuards } from '../security/mockGuard.js';
import { getSecurityConfig } from '../security/config.js';
import { validateRequest } from '../security/schemaValidator.js';
import { securityLogger } from '../security/securityLogger.js';

const authRouter = express.Router();

// Validation Schemas
const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15)
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().min(4).max(8)
});

// Auth Token Verification Middleware
export const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwtService.verify(token);
    const uid = decoded.userId || decoded.id;
    const foundUser = userRepository.getUserById(uid);
    req.user = foundUser ? passwordService.sanitizeUser(foundUser) : (uid ? { id: uid, ...decoded } : undefined);
  } catch (error: any) {
    securityLogger.logSecurityEvent({
      type: 'INVALID_TOKEN',
      requestId: (req as any).id,
      path: req.originalUrl || req.path,
      details: { error: error.message }
    });
    req.user = undefined;
  }
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized access',
      requestId: (req as any).id
    });
  }
  next();
};

authRouter.post(
  "/send-otp",
  rateLimiters.authStrict.middleware(),
  mockGuards.requireServiceConfigured('SMS'),
  validateRequest({ body: sendOtpSchema }),
  async (req: Request, res: Response) => {
    const { phone } = req.body;
    const config = getSecurityConfig();

    const { code } = otpService.generateOTP(phone);

    try {
      const sendResult = await smsService.sendOtp(phone, code);

      // Development/test behavior explicitly separated
      if (!config.isProduction) {
        return res.json({
          message: "کد تأیید با موفقیت ارسال شد.",
          devCode: config.isTest ? code : undefined,
          status: sendResult.status
        });
      }

      // Production: Never return OTP or log it
      return res.json({ message: "کد تأیید ارسال شد." });
    } catch (err: any) {
      return res.status(500).json({
        code: 'SMS_DISPATCH_FAILED',
        error: err.message || 'خطا در ارسال پیامک تأیید'
      });
    }
  }
);

authRouter.post(
  "/verify-otp",
  rateLimiters.authStrict.middleware(),
  validateRequest({ body: verifyOtpSchema }),
  (req: Request, res: Response) => {
    const { phone, code } = req.body;

    const verification = otpService.verifyOTP(phone, code);
    if (!verification.success) {
      securityLogger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        requestId: (req as any).id,
        path: req.originalUrl || req.path,
        details: { phone, reason: verification.error }
      });

      return res.status(400).json({
        code: verification.error || 'INVALID_OTP',
        error: "کد تأیید نامعتبر، منقضی شده یا تعداد تلاش بیش از حد مجاز است.",
        requestId: (req as any).id
      });
    }

    let user = userRepository.getUserByPhone(phone);
    if (!user) {
      user = userRepository.createUser({ phone, name: "", activeSubscriptionId: null });
    }

    const token = jwtService.sign({ userId: user.id, phone: user.phone, role: user.role });
    const safeUser = passwordService.sanitizeUser(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      userId: user.id,
      token,
      user: safeUser
    });
  }
);

authRouter.get("/me", verifyAuthToken, requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default authRouter;
