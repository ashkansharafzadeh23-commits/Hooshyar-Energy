/**
 * Idempotency Management (PH-4)
 * Protects high-risk mutation endpoints from accidental duplicate side effects.
 * Supports Idempotency-Key headers with TTL and memory caching.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../observability/logger.js';

export interface IdempotencyRecord {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  createdAt: number;
  expiresAt: number;
}

class IdempotencyStore {
  private records = new Map<string, IdempotencyRecord>();
  private defaultTtlMs = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Periodic garbage collection every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  public get(key: string): IdempotencyRecord | undefined {
    const record = this.records.get(key);
    if (!record) return undefined;
    if (Date.now() > record.expiresAt) {
      this.records.delete(key);
      return undefined;
    }
    return record;
  }

  public set(key: string, statusCode: number, headers: Record<string, string>, body: any, ttlMs?: number): void {
    const now = Date.now();
    const effectiveTtl = ttlMs || this.defaultTtlMs;
    this.records.set(key, {
      statusCode,
      headers,
      body,
      createdAt: now,
      expiresAt: now + effectiveTtl
    });
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [k, v] of this.records.entries()) {
      if (now > v.expiresAt) {
        this.records.delete(k);
      }
    }
  }

  public clear(): void {
    this.records.clear();
  }
}

export const idempotencyStore = new IdempotencyStore();

/**
 * Express middleware to enforce Idempotency-Key on critical mutations
 */
export function idempotencyMiddleware(scopeOrOptions?: string | { ttlMs?: number }, maybeOptions?: { ttlMs?: number }) {
  const scope = typeof scopeOrOptions === 'string' ? scopeOrOptions : undefined;
  const options = typeof scopeOrOptions === 'object' ? scopeOrOptions : maybeOptions;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to mutations
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
      return next();
    }

    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (!idempotencyKey) {
      // If no key provided, proceed normally without caching
      return next();
    }

    const userId = (req as any).user?.id || 'anonymous';
    const prefix = scope ? `${scope}:` : '';
    const storageKey = `${prefix}${req.baseUrl || ''}${req.path}:${userId}:${idempotencyKey}`;

    const cached = idempotencyStore.get(storageKey);
    if (cached) {
      logger.info(`Idempotency key matched; returning cached response`, {
        service: 'IDEMPOTENCY',
        event: 'IDEMPOTENT_REPLAY',
        metadata: { path: req.originalUrl, idempotencyKey }
      });
      res.setHeader('X-Idempotent-Replay', 'true');
      return res.status(cached.statusCode).json(cached.body);
    }

    // Intercept response to store result
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        idempotencyStore.set(storageKey, res.statusCode, {}, body, options?.ttlMs);
      }
      return originalJson(body);
    };

    next();
  };
}
