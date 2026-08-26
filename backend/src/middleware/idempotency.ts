import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/connections.js';

const excluded = new Set(['/auth/login', '/auth/refresh', '/auth/logout']);

export function idempotency(windowSeconds = 86400) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || excluded.has(req.path)) return next();
    const supplied = req.header('Idempotency-Key');
    if (!supplied || supplied.length < 8 || supplied.length > 160) return next();
    const tokenFingerprint = crypto.createHash('sha256').update(String(req.headers.authorization ?? req.ip)).digest('hex').slice(0, 24);
    const tenant = String(req.auth?.tenantId ?? req.header('x-tenant-id') ?? 'unknown');
    const key = `covenx:idempotency:${tenant}:${tokenFingerprint}:${req.method}:${req.path}:${crypto.createHash('sha256').update(supplied).digest('hex')}`;
    try {
      if ((redis as any).status !== 'ready') return next();
      const cached = await redis.get(`${key}:response`);
      if (cached) { const value = JSON.parse(cached); return res.status(value.status).json(value.body); }
      const lock = await redis.set(`${key}:lock`, '1', 'EX', 120, 'NX');
      if (lock !== 'OK') return res.status(409).json({ success: false, error: { code: 'IDEMPOTENCY_IN_PROGRESS', message: 'An equivalent request is already being processed' }, meta: { requestId: req.requestId } });
      const originalJson = res.json.bind(res);
      res.json = ((body: any) => { if (res.statusCode >= 200 && res.statusCode < 300) void redis.set(`${key}:response`, JSON.stringify({ status: res.statusCode, body }), 'EX', windowSeconds); void redis.del(`${key}:lock`); return originalJson(body); }) as typeof res.json;
      const originalEnd = res.end.bind(res);
      res.end = ((...args: any[]) => { void redis.del(`${key}:lock`); return originalEnd(...args); }) as typeof res.end;
      return next();
    } catch { return next(); }
  };
}
