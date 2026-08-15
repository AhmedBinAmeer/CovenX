import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticateJWT);
router.get('/dashboard', analyticsController.getDashboardMetrics);

export default router;
