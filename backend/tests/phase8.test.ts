import { describe, expect, it } from 'vitest';
import { DashboardProjection } from '../src/models/index.js';
import { emitRealtime } from '../src/services/realtime.js';

describe('CovenX Phase 8 foundations', () => {
  it('defines tenant-scoped dashboard projection fields', () => {
    expect(DashboardProjection.schema.path('tenantId')).toBeDefined();
    expect(DashboardProjection.schema.path('projectionType')).toBeDefined();
    expect(DashboardProjection.schema.path('metrics')).toBeDefined();
    expect(DashboardProjection.schema.path('dataAsOf')).toBeDefined();
  });

  it('emits only reference and status payloads through the realtime boundary', () => {
    const emitted: any[] = [];
    const io: any = { to: (room: string) => ({ emit: (event: string, payload: any) => emitted.push({ room, event, payload }) }) };
    emitRealtime(io, 'dashboard.updated', { tenantId: 'tenant-a', userId: 'user-a', contractId: 'contract-a', payload: { status: 'active' } });
    expect(emitted.map((entry) => entry.room)).toEqual(['tenant:tenant-a', 'user:user-a', 'contract:contract-a']);
    expect(emitted.every((entry) => entry.payload.tenantId === 'tenant-a')).toBe(true);
    expect(emitted.some((entry) => Object.hasOwn(entry.payload, 'fileContents'))).toBe(false);
  });
});
