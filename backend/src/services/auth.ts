import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { redis } from '../config/connections.js';
import { User, Role, AuditLog } from '../models/index.js';

export type AuthContext = { userId: string; tenantId: string; sessionId: string; roleIds: string[]; permissions: string[]; authVersion: number };
export const refreshKey = (id: string) => `refresh:${id}`;

async function permissionsFor(roleIds: string[], tenantId: string) { const roles = await Role.find({ _id: { $in: roleIds }, tenantId, status: 'active' }).populate('permissionIds'); return roles.flatMap((r: any) => (r.permissionIds ?? []).map((p: any) => p.key)); }
export async function issueAccessToken(input: { userId: string; tenantId: string; sessionId: string; roleIds: string[]; authVersion: number }) { const permissions = await permissionsFor(input.roleIds, input.tenantId); return jwt.sign({ ...input, permissions }, config.JWT_SECRET, { expiresIn: config.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] }); }

export async function signIn(email: string, password: string, tenantId: string, request: { ip?: string; userAgent?: string; requestId?: string }) {
  const user = await User.findOne({ tenantId, normalizedEmail: email.trim().toLowerCase() });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash)) || user.status !== 'active') throw new Error('INVALID_CREDENTIALS');
  const sessionId = crypto.randomUUID();
  const roleIds = user.roleIds.map(String);
  const accessToken = await issueAccessToken({ userId: user.id, tenantId, sessionId, roleIds, authVersion: user.authVersion });
  const refreshToken = crypto.randomBytes(48).toString('hex');
  await redis.set(refreshKey(sessionId), JSON.stringify({ hash: await bcrypt.hash(refreshToken, 10), userId: user.id, tenantId, roleIds, authVersion: user.authVersion, createdAt: new Date().toISOString(), ip: request.ip, userAgent: request.userAgent }), 'EX', config.REFRESH_TOKEN_DAYS * 86400);
  user.lastLoginAt = new Date(); await user.save();
  await writeAudit({ tenantId, actorId: user.id, action: 'auth.login', entity: { type: 'user', id: user.id }, result: 'success', ...request });
  return { accessToken, refreshToken, sessionId, user: user.toObject({ transform: (_d, r) => { delete (r as any).passwordHash; return r; } }) };
}

export function verifyAccess(token: string): AuthContext { return jwt.verify(token, config.JWT_SECRET) as AuthContext; }
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function writeAudit(input: any) { return AuditLog.create({ ...input, timestamp: new Date() }); }
export async function listSessions(userId: string, tenantId: string) { const keys = await redis.keys('refresh:*'); const sessions: any[] = []; for (const key of keys) { const raw = await redis.get(key); if (!raw) continue; const record = JSON.parse(raw); if (record.userId === userId && record.tenantId === tenantId) sessions.push({ sessionId: key.slice('refresh:'.length), createdAt: record.createdAt, ip: record.ip, userAgent: record.userAgent }); } return sessions; }
export async function revokeSession(sessionId: string, userId: string, tenantId: string) { const raw = await redis.get(refreshKey(sessionId)); if (!raw) throw new Error('SESSION_NOT_FOUND'); const record = JSON.parse(raw); if (record.userId !== userId || record.tenantId !== tenantId) throw new Error('SESSION_NOT_FOUND'); await redis.del(refreshKey(sessionId)); }
export async function rotateRefresh(sessionId: string, token: string) { const raw = await redis.get(refreshKey(sessionId)); if (!raw) throw new Error('TOKEN_INVALID'); const record = JSON.parse(raw); if (!(await bcrypt.compare(token, record.hash))) { await redis.del(refreshKey(sessionId)); throw new Error('REFRESH_REUSE_DETECTED'); } const next = crypto.randomBytes(48).toString('hex'); record.hash = await bcrypt.hash(next, 10); await redis.set(refreshKey(sessionId), JSON.stringify(record), 'EX', config.REFRESH_TOKEN_DAYS * 86400); return next; }
