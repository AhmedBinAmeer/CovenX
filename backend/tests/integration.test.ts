import mongoose from 'mongoose';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { Contract, asId } from '../src/models/index.js';

const enabled = Boolean(process.env.MONGODB_TEST_URI);
describe.skipIf(!enabled)('CovenX MongoDB integration', () => {
  const tenantA = asId('000000000000000000000001');
  const tenantB = asId('000000000000000000000002');
  const owner = asId('000000000000000000000003');
  beforeAll(async () => { await mongoose.connect(process.env.MONGODB_TEST_URI!); await Contract.deleteMany({ contractNumber: /^integration-/ }); });
  afterAll(async () => { await Contract.deleteMany({ contractNumber: /^integration-/ }); await mongoose.disconnect(); });

  it('creates contracts and isolates tenants', async () => {
    await Contract.create({ tenantId: tenantA, contractNumber: 'integration-a', title: 'A', contractType: 'service', ownerId: owner });
    expect(await Contract.countDocuments({ tenantId: tenantA })).toBe(1);
    expect(await Contract.countDocuments({ tenantId: tenantB })).toBe(0);
  });

  it('enforces duplicate contract numbers within a tenant', async () => {
    await expect(Contract.create({ tenantId: tenantA, contractNumber: 'integration-a', title: 'Duplicate', contractType: 'service', ownerId: owner })).rejects.toMatchObject({ code: 11000 });
  });
});
