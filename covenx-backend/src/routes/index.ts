import { Router } from 'express';
import authRoutes from './auth.routes.js';
import contractRoutes from './contract.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/contracts', contractRoutes);

export default apiRouter;
