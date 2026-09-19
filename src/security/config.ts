/**
 * Hooshyar Energy - Central Security Configuration (PH-3)
 */

export interface SecurityConfig {
  isProduction: boolean;
  isTest: boolean;
  jwt: {
    secret: string;
    issuer: string;
    audience: string;
    expiresIn: string;
  };
  otp: {
    length: number;
    expiryMs: number;
    maxAttempts: number;
  };
  cors: {
    allowedOrigins: string[];
  };
  bodyLimit: string;
  mocks: {
    smsConfigured: boolean;
    paymentConfigured: boolean;
    aiConfigured: boolean;
  };
}

export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  const isTest = env === 'test';

  // Strict JWT Secret validation
  let jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (isProduction) {
      throw new Error("FATAL: JWT_SECRET environment variable is strictly required in production mode.");
    }
    // Explicitly isolated development/test fallback only
    jwtSecret = 'dev_insecure_ephemeral_secret';
  }

  // Parse CORS allowed origins
  let allowedOrigins: string[] = [];
  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
  } else if (!isProduction) {
    // Development localhost allowances explicitly restricted to dev/test
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
  }

  return {
    isProduction,
    isTest,
    jwt: {
      secret: jwtSecret,
      issuer: process.env.JWT_ISSUER || 'hooshyar-energy',
      audience: process.env.JWT_AUDIENCE || 'hooshyar-api',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    otp: {
      length: 6,
      expiryMs: 3 * 60 * 1000, // 3 minutes
      maxAttempts: 3
    },
    cors: {
      allowedOrigins
    },
    bodyLimit: process.env.BODY_LIMIT || '1mb',
    mocks: {
      smsConfigured: Boolean(process.env.SMS_API_KEY || process.env.KAVENEGAR_API_KEY),
      paymentConfigured: Boolean(process.env.ZARINPAL_MERCHANT_ID),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY)
    }
  };
}
