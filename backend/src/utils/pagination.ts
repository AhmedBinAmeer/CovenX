import crypto from 'node:crypto';

export type Cursor = { updatedAt: string; id: string; fingerprint: string };
export function encodeCursor(cursor: Cursor): string { return Buffer.from(JSON.stringify(cursor)).toString('base64url'); }
export function decodeCursor(raw: unknown): Cursor | null { if (typeof raw !== 'string' || raw.length > 1024) return null; try { const value = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')); if (typeof value.updatedAt !== 'string' || typeof value.id !== 'string' || typeof value.fingerprint !== 'string') return null; return value; } catch { return null; } }
export function queryFingerprint(input: unknown): string { return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
export function pageLimit(raw: unknown): number { const value = Number(raw ?? 25); return Number.isInteger(value) && value > 0 ? Math.min(value, 100) : 25; }
