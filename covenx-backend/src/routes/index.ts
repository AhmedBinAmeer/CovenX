import { Router } from 'express';
import authRoutes from './auth.routes.js';
import contractRoutes from './contract.routes.js';
import analyticsRoutes from './analytics.routes.js';
import templateRoutes from './template.routes.js';
import clauseRoutes from './clause.routes.js';
import auditRoutes from './audit.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/contracts', contractRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/templates', templateRoutes);
apiRouter.use('/clauses', clauseRoutes);
apiRouter.use('/audit-logs', auditRoutes);

export default apiRouter;
