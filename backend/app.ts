import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import { config } from './src/config/index.js';
import { connectInfrastructure, infrastructureStatus, disconnectInfrastructure } from './src/config/connections.js';
import { seedRbac } from './src/config/seed.js';
import api from './src/routes/api.js';
import { notFound, errorHandler, distributedRateLimit } from './src/middleware/index.js';
import { observeRequest, metricsSnapshot } from './src/services/observability.js';
import { attachRealtime } from './src/services/realtime.js';
import { storageProvider } from './src/services/storage.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false, strictTransportSecurity: config.NODE_ENV === 'production' ? undefined : false }));
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(distributedRateLimit('mutations', config.RATE_LIMIT_WINDOW_MS, config.RATE_LIMIT_MAX));
app.use(cookieParser());
app.use((req, res, next) => { req.requestId = req.header('x-request-id') ?? crypto.randomUUID(); const started = Date.now(); res.on('finish', () => observeRequest({ requestId: req.requestId, tenantId: req.auth?.tenantId, userId: req.auth?.userId, route: req.path, status: res.statusCode, latencyMs: Date.now() - started })); next(); });
app.get('/health/live', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/metrics', (_req, res) => res.json({ success: true, data: metricsSnapshot() }));
app.get('/health/ready', async (_req, res) => { const status = infrastructureStatus(); const storage = await storageProvider.checkHealth?.().catch(() => false) ?? true; const ready = status.database === 'ready' && storage; res.status(ready ? 200 : 503).json({ success: ready, data: { database: status.database, redis: status.redis, storageProvider: storage ? 'ready' : 'not_ready', application: 'ready' } }); });
app.use('/api/v1', api);
app.use(notFound);
app.use(errorHandler);

export let realtimeServer: ReturnType<typeof attachRealtime> | null = null;
export async function shutdown() { await disconnectInfrastructure(); }
if (process.env.NODE_ENV !== 'test') {
  connectInfrastructure().then(async () => { if (process.env.SEED_RBAC === 'true') await seedRbac('000000000000000000000001'); const server = createServer(app); realtimeServer = attachRealtime(server); server.listen(config.PORT, () => console.log(`CovenX API listening on ${config.PORT}`)); }).catch((error) => { console.error('Infrastructure startup failed', error); process.exit(1); });
}
