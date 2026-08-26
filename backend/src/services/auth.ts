import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { redis } from '../config/connections.js';
import { User, Role, AuditLog, Organization } from '../models/index.js';
import { seedRbac } from '../config/seed.js';

export type AuthContext = { userId: string; tenantId: string; sessionId: string; roleIds: string[]; permissions: string[]; authVersion: number };
export const refreshKey = (id: string) => `refresh:${id}`;

async function permissionsFor(roleIds: string[], tenantId: string) { const roles = await Role.find({ _id: { $in: roleIds }, tenantId, status: 'active' }).populate('permissionIds'); return roles.flatMap((r: any) => (r.permissionIds ?? []).map((p: any) => p.key)); }
export async function issueAccessToken(input: { userId: string; tenantId: string; sessionId: string; roleIds: string[]; authVersion: number }) { const permissions = await permissionsFor(input.roleIds, input.tenantId); return jwt.sign({ ...input, permissions }, config.JWT_SECRET, { expiresIn: config.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] }); }

export async function registerCompany(input: { companyName: string; workspaceSlug?: string; email: string; password: string; firstName: string; lastName: string; industry?: string; companySize?: string; contractVolume?: string }, request: { ip?: string; userAgent?: string; requestId?: string }) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const name = input.companyName.trim();
  const baseSlug = (input.workspaceSlug?.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) || 'workspace';
  const slug = input.workspaceSlug?.trim() ? baseSlug : `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
  const existing = await Organization.findOne({ slug });
  if (existing) throw new Error('WORKSPACE_SLUG_UNAVAILABLE');
  const organization = await Organization.create({ name, normalizedName: name.toLowerCase(), slug, status: 'onboarding', plan: 'trial', onboarding: { currentStep: 'profile', completedSteps: [] }, trial: { startedAt: new Date(), endsAt: new Date(Date.now() + 14 * 86400000) }, profile: { industry: input.industry, companySize: input.companySize, contractVolume: input.contractVolume } });
  try {
    await seedRbac(String(organization._id));
    const adminRole = await Role.findOne({ tenantId: String(organization._id), key: 'super-admin', status: 'active' });
    if (!adminRole) throw new Error('BOOTSTRAP_ROLE_MISSING');
    const user = await User.create({ tenantId: organization._id, email: input.email.trim(), normalizedEmail, passwordHash: await hashPassword(input.password), emailVerified: false, profile: { firstName: input.firstName.trim(), lastName: input.lastName.trim(), displayName: `${input.firstName.trim()} ${input.lastName.trim()}` }, organization: { name, slug }, roleIds: [adminRole._id], status: 'active' });
    organization.ownerUserId = user._id;
    await organization.save();
    const result = await createSessionForUser(user, String(organization._id), request);
    await writeAudit({ tenantId: String(organization._id), actorId: user.id, action: 'organization.registered', entity: { type: 'organization', id: organization.id }, result: 'success', requestId: request.requestId, metadata: { plan: organization.plan, workspaceSlug: organization.slug } });
    return { ...result, organization: organization.toObject(), emailVerificationRequired: true };
  } catch (error) {
    await User.deleteMany({ tenantId: organization._id });
    await Role.deleteMany({ tenantId: organization._id });
    await Organization.deleteOne({ _id: organization._id });
    throw error;
  }
}

async function createSessionForUser(user: any, tenantId: string, request: { ip?: string; userAgent?: string; requestId?: string }) {
  const sessionId = crypto.randomUUID();
  const roleIds = user.roleIds.map(String);
  const accessToken = await issueAccessToken({ userId: user.id, tenantId, sessionId, roleIds, authVersion: user.authVersion });
  const refreshToken = crypto.randomBytes(48).toString('hex');
  await redis.set(refreshKey(sessionId), JSON.stringify({ hash: await bcrypt.hash(refreshToken, 10), userId: user.id, tenantId, roleIds, authVersion: user.authVersion, createdAt: new Date().toISOString(), ip: request.ip, userAgent: request.userAgent }), 'EX', config.REFRESH_TOKEN_DAYS * 86400);
  return { accessToken, refreshToken, sessionId, user: user.toObject({ transform: (_d: unknown, r: any) => { delete r.passwordHash; return r; } }) };
}

export async function signIn(email: string, password: string, tenantId: string, request: { ip?: string; userAgent?: string; requestId?: string }) {
  const user = await User.findOne({ tenantId, normalizedEmail: email.trim().toLowerCase() });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash)) || user.status !== 'active') throw new Error('INVALID_CREDENTIALS');
  const result = await createSessionForUser(user, tenantId, request);
  user.lastLoginAt = new Date(); await user.save();
  await writeAudit({ tenantId, actorId: user.id, action: 'auth.login', entity: { type: 'user', id: user.id }, result: 'success', ...request });
  return result;
}

export function verifyAccess(token: string): AuthContext { return jwt.verify(token, config.JWT_SECRET) as AuthContext; }
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function writeAudit(input: any) { return AuditLog.create({ ...input, timestamp: new Date() }); }
export async function listSessions(userId: string, tenantId: string) { const keys = await redis.keys('refresh:*'); const sessions: any[] = []; for (const key of keys) { const raw = await redis.get(key); if (!raw) continue; const record = JSON.parse(raw); if (record.userId === userId && record.tenantId === tenantId) sessions.push({ sessionId: key.slice('refresh:'.length), createdAt: record.createdAt, ip: record.ip, userAgent: record.userAgent }); } return sessions; }
export async function revokeSession(sessionId: string, userId: string, tenantId: string) { const raw = await redis.get(refreshKey(sessionId)); if (!raw) throw new Error('SESSION_NOT_FOUND'); const record = JSON.parse(raw); if (record.userId !== userId || record.tenantId !== tenantId) throw new Error('SESSION_NOT_FOUND'); await redis.del(refreshKey(sessionId)); }
export async function rotateRefresh(sessionId: string, token: string) { const raw = await redis.get(refreshKey(sessionId)); if (!raw) throw new Error('TOKEN_INVALID'); const record = JSON.parse(raw); if (!(await bcrypt.compare(token, record.hash))) { await redis.del(refreshKey(sessionId)); throw new Error('REFRESH_REUSE_DETECTED'); } const next = crypto.randomBytes(48).toString('hex'); record.hash = await bcrypt.hash(next, 10); await redis.set(refreshKey(sessionId), JSON.stringify(record), 'EX', config.REFRESH_TOKEN_DAYS * 86400); return next; }
