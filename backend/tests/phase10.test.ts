import { describe, expect, it } from 'vitest';
import { governancePolicy, retentionEligibility } from '../src/config/governance.js';
import { providerHealth } from '../src/services/health.js';

describe('CovenX Phase 10 enterprise hardening', () => {
  it('keeps destructive retention deletion disabled and respects legal hold', () => {
    expect(governancePolicy.destructiveDeletionEnabled).toBe(false);
    const result = retentionEligibility({ createdAt: new Date(0), retentionDays: 1, legalHold: true });
    expect(result.eligible).toBe(false);
  });

  it('exposes all provider health dimensions without secrets', async () => {
    const status = await providerHealth();
    expect(status).toHaveProperty('database');
    expect(status).toHaveProperty('redis');
    expect(status).toHaveProperty('storageProvider');
    expect(status).toHaveProperty('emailProvider');
    expect(status).toHaveProperty('searchProvider');
    expect(JSON.stringify(status)).not.toContain('SECRET');
  });
});
