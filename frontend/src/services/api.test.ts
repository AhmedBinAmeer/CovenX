import { describe, expect, it } from 'vitest';
import { listItems, pageInfo } from './api';
import { capabilities } from '../utils/permissions';

describe('CovenX API helpers', () => {
  it('normalizes paginated and array responses', () => { expect(listItems({ items: [{ _id: '1' }], nextCursor: 'next' })).toHaveLength(1); expect(listItems([{ _id: '2' }])).toHaveLength(1); expect(pageInfo({ items: [{ _id: '1' }], nextCursor: 'next' }).nextCursor).toBe('next'); });
  it('exposes only the capabilities present on a role', () => { const value = capabilities({ _id: '1', email: 'owner@example.com', permissions: ['contract:read', 'report:read'] }); expect(value.canReadContracts).toBe(true); expect(value.canReport).toBe(true); expect(value.canReadUsers).toBe(false); });
});
