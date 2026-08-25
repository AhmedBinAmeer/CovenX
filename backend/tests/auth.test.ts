import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { config } from '../src/config/index.js';
import { hashPassword, verifyAccess } from '../src/services/auth.js';

describe('CovenX authentication primitives', () => {
  it('hashes passwords without preserving the plaintext', async () => {
    const password = 'CorrectHorseBatteryStaple!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('verifies an access token into the expected auth context', () => {
    const token = jwt.sign({ userId: 'usr_1', tenantId: 'tenant_1', sessionId: 'session_1', roleIds: [], permissions: ['contract:read'], authVersion: 1 }, config.JWT_SECRET);
    expect(verifyAccess(token)).toMatchObject({ userId: 'usr_1', tenantId: 'tenant_1', permissions: ['contract:read'] });
  });
});
