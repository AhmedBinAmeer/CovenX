import { describe, expect, it } from 'vitest';
import { Obligation, SignatureRequest } from '../src/models/index.js';
import { renewalDue } from '../src/services/renewals.js';

describe('CovenX Phase 5 foundations', () => {
  it('exposes required signature and obligation persistence fields', () => {
    expect(SignatureRequest.schema.path('contractId')).toBeDefined();
    expect(SignatureRequest.schema.path('signers')).toBeDefined();
    expect(Obligation.schema.path('dueDate')).toBeDefined();
    expect(Obligation.schema.path('version')).toBeDefined();
  });

  it('calculates renewal due dates without external schedulers', () => {
    const now = new Date('2026-08-25T00:00:00.000Z');
    expect(renewalDue(new Date('2026-10-01T00:00:00.000Z'), 90, now)).toBe(true);
    expect(renewalDue(new Date('2027-01-01T00:00:00.000Z'), 90, now)).toBe(false);
  });
});
