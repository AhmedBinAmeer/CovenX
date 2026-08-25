import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import { config } from './src/config/index.js';
import { connectInfrastructure } from './src/config/connections.js';
import { seedRbac } from './src/config/seed.js';
import api from './src/routes/api.js';
import { notFound, errorHandler, rateLimit } from './src/middleware/index.js';
import { attachRealtime } from './src/services/realtime.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit());
app.use(cookieParser());
app.use((req, _res, next) => { req.requestId = req.header('x-request-id') ?? crypto.randomUUID(); next(); });
app.get('/health/live', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/v1', api);
app.use(notFound);
app.use(errorHandler);

export let realtimeServer: ReturnType<typeof attachRealtime> | null = null;
if (process.env.NODE_ENV !== 'test') {
  connectInfrastructure().then(async () => { if (process.env.SEED_RBAC === 'true') await seedRbac('000000000000000000000001'); const server = createServer(app); realtimeServer = attachRealtime(server); server.listen(config.PORT, () => console.log(`CovenX API listening on ${config.PORT}`)); }).catch((error) => { console.error('Infrastructure startup failed', error); process.exit(1); });
}
