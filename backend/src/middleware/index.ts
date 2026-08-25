import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';
import { verifyAccess, AuthContext } from '../services/auth.js';

declare global { namespace Express { interface Request { auth?: AuthContext; requestId?: string } } }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!token) throw new Error(); req.auth = verifyAccess(token); next(); }
  catch { res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication is required' }, meta: { requestId: req.requestId } }); }
}
export function requirePermission(permission: string) { return (req: Request, res: Response, next: NextFunction) => { if (!req.auth?.permissions.includes(permission) && !req.auth?.permissions.includes('*')) return res.status(403).json({ success: false, error: { code: 'PERMISSION_DENIED', message: 'Permission denied' }, meta: { requestId: req.requestId } }); next(); }; }
export function validate(schema: ZodType) { return (req: Request, res: Response, next: NextFunction) => { const result = schema.safeParse({ body: req.body, params: req.params, query: req.query }); if (!result.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_FAILED', message: 'Request validation failed', details: result.error.issues }, meta: { requestId: req.requestId } }); req.body = (result.data as any).body; next(); }; }
export function notFound(_req: Request, res: Response) { res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Resource not found' } }); }
export function errorHandler(error: any, req: Request, res: Response, _next: NextFunction) { const known = ['INVALID_CREDENTIALS', 'TOKEN_INVALID', 'REFRESH_REUSE_DETECTED', 'CONFLICT', 'VERSION_CONFLICT']; const code = known.includes(error?.message) ? error.message : 'INTERNAL_ERROR'; res.status(code === 'INTERNAL_ERROR' ? 500 : code.includes('TOKEN') || code.includes('CREDENTIAL') ? 401 : 409).json({ success: false, error: { code, message: code === 'INTERNAL_ERROR' ? 'Unexpected server error' : code }, meta: { requestId: req.requestId } }); }
