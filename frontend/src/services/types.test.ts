import { describe, expect, it } from 'vitest';
import { clauseCreateSchema, contractCreateSchema, notificationPreferencesSchema } from './types';

describe('CovenX frontend request schemas', () => {
  it('accepts a valid contract draft', () => { const result = contractCreateSchema.safeParse({ contractNumber: 'CX-001', title: 'Master services agreement', contractType: 'service', parties: [{ name: 'Acme', role: 'counterparty' }], financial: { value: '1000.00', currency: 'USD' } }); expect(result.success).toBe(true); });
  it('rejects malformed Mongo IDs in clause references', () => { const result = clauseCreateSchema.safeParse({ key: 'payment-term', title: 'Payment', body: 'Net thirty days.', category: 'commercial', riskClassification: 'medium', tags: ['finance'] }); expect(result.success).toBe(true); });
  it('requires at least one notification channel', () => { const result = notificationPreferencesSchema.safeParse({ categories: ['approval'], channels: [], enabled: true }); expect(result.success).toBe(false); });
});
