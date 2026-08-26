import crypto from 'node:crypto';
import { config } from '../config/index.js';

const algorithm = 'aes-256-gcm';

function key() {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!raw || !/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error('INTEGRATION_ENCRYPTION_KEY_REQUIRED');
  return Buffer.from(raw, 'hex');
}

export function encryptSecret(value: unknown) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return { secretCiphertext: ciphertext.toString('base64'), secretIv: iv.toString('base64'), secretTag: cipher.getAuthTag().toString('base64') };
}

export function decryptSecret(input: { secretCiphertext: string; secretIv: string; secretTag: string }) {
  const decipher = crypto.createDecipheriv(algorithm, key(), Buffer.from(input.secretIv, 'base64'));
  decipher.setAuthTag(Buffer.from(input.secretTag, 'base64'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(input.secretCiphertext, 'base64')), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext);
}

export function redactedIntegration(input: any) {
  const value = input?.toObject ? input.toObject() : { ...input };
  delete value.secretCiphertext;
  delete value.secretIv;
  delete value.secretTag;
  delete value.__v;
  return { ...value, hasSecret: Boolean(input?.secretCiphertext) };
}

export function verifySlackSignature(rawBody: string, signature: string | undefined, timestamp: string | undefined, signingSecret: string) {
  if (!signature || !timestamp) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;
  const base = `v0:${timestamp}:${rawBody}`;
  const expected = `v0=${crypto.createHmac('sha256', signingSecret).update(base).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyHmacSignature(rawBody: string, signature: string | undefined, secret: string, algorithmName: 'sha256' | 'sha1' = 'sha256') {
  if (!signature) return false;
  const digest = crypto.createHmac(algorithmName, secret).update(rawBody).digest('hex');
  const normalized = signature.replace(/^sha256=/, '').replace(/^sha1=/, '');
  return digest.length === normalized.length && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(normalized));
}

export function providerHealthStatus(type: string, secret: unknown) {
  if (!secret) return { status: 'degraded', message: `${type} credentials are not configured` };
  return { status: 'connected', message: `${type} credentials are stored securely` };
}

export const supportedIntegrationTypes = ['salesforce', 'slack', 'docusign'] as const;
export type IntegrationType = typeof supportedIntegrationTypes[number];
export const integrationConfig = { providerApiTimeoutMs: 10000, appEnvironment: config.NODE_ENV };
