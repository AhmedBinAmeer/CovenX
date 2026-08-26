import { describe, expect, it } from 'vitest';
import { encryptSecret, decryptSecret, verifyHmacSignature, verifySlackSignature } from '../src/services/integrations.js';

process.env.INTEGRATION_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('CovenX integration security helpers', () => {
  it('encrypts and decrypts provider secrets without exposing plaintext fields', () => {
    const encrypted = encryptSecret({ clientSecret: 'private-value', webhookSecret: 'hook-value' });
    expect(encrypted.secretCiphertext).not.toContain('private-value');
    expect(decryptSecret(encrypted)).toEqual({ clientSecret: 'private-value', webhookSecret: 'hook-value' });
  });
  it('verifies generic HMAC webhook signatures and rejects tampering', () => {
    const body = '{"event":"contract.signed"}';
    const signature = require('node:crypto').createHmac('sha256', 'secret').update(body).digest('hex');
    expect(verifyHmacSignature(body, signature, 'secret')).toBe(true);
    expect(verifyHmacSignature(`${body}x`, signature, 'secret')).toBe(false);
  });
  it('rejects stale Slack signatures', () => {
    const timestamp = String(Math.floor(Date.now() / 1000) - 301);
    expect(verifySlackSignature('{}', 'v0=invalid', timestamp, 'secret')).toBe(false);
  });
});
