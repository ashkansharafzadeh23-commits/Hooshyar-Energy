import { Request, Response, NextFunction } from 'express';
import { getSecurityConfig } from '../security/config.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const config = getSecurityConfig();
  const statusCode = err.statusCode || 500;
  const requestId = (req as any).id || 'unknown';

  // Safe default code and message
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  
  // In production, never leak sensitive server errors, stack traces, paths, or db details
  let message = err.message;
  if (config.isProduction && statusCode >= 500) {
    message = 'An unexpected internal server error occurred. Please try again later.';
  }

  const responsePayload: Record<string, any> = {
    code,
    message,
    requestId
  };

  if (err.details && statusCode < 500) {
    responsePayload.details = err.details;
  }

  // Only include stack trace if explicitly in non-production mode
  if (!config.isProduction && err.stack) {
    responsePayload.stack = err.stack;
  }

  // Safe server-side error logging (redacted)
  console.error(`[ERROR] [${requestId}] ${code} (${statusCode}): ${err.message}`);

  if (!res.headersSent) {
    res.status(statusCode).json(responsePayload);
  }
};
