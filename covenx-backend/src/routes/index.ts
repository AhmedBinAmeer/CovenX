import { Router } from 'express';
import authRoutes from './auth.routes';
import contractRoutes from './contract.routes';
import analyticsRoutes from './analytics.routes';
import templateRoutes from './template.routes';
import clauseRoutes from './clause.routes';
import auditRoutes from './audit.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/contracts', contractRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/templates', templateRoutes);
apiRouter.use('/clauses', clauseRoutes);
apiRouter.use('/audit-logs', auditRoutes);

export default apiRouter;
