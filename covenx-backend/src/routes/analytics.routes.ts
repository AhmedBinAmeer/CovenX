import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticateJWT);
router.get('/dashboard', analyticsController.getDashboardMetrics);

export default router;
