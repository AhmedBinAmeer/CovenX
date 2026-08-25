import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';

describe('CovenX API foundation', () => {
  it('returns a live health response', async () => {
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { status: 'ok' } });
  });

  it('enforces authentication on protected resources', async () => {
    const response = await request(app).get('/api/v1/contracts');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('returns a safe not-found envelope', async () => {
    const response = await request(app).get('/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});
