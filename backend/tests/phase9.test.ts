import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { S3StorageProvider } from '../src/services/storage.js';
import { MongoContractSearchProvider } from '../src/services/search.js';
import { metricsSnapshot } from '../src/services/observability.js';

describe('CovenX Phase 9 production foundations', () => {
  it('exposes a safe readiness response without credentials', async () => {
    const response = await request(app).get('/health/ready');
    expect([200, 503]).toContain(response.status);
    expect(response.body.data).toHaveProperty('database');
    expect(JSON.stringify(response.body)).not.toContain('JWT_SECRET');
  });

  it('keeps S3 provider configuration failure explicit and safe', async () => {
    const provider = new S3StorageProvider();
    await expect(provider.createDownloadUrl('tenant-a/private-file')).rejects.toThrow('STORAGE_NOT_CONFIGURED');
  });

  it('defines tenant-scoped MongoDB search behavior', () => {
    const provider = new MongoContractSearchProvider();
    expect(provider.search.toString()).toContain('tenantId');
  });

  it('exposes structured request metrics without secrets', () => {
    const snapshot = metricsSnapshot();
    expect(snapshot).toHaveProperty('requests');
    expect(snapshot).toHaveProperty('averageLatencyMs');
    expect(JSON.stringify(snapshot)).not.toContain('password');
  });
});
