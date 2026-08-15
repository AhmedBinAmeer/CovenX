import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();
const auditController = new AuditController();

router.use(authenticateJWT);
router.get('/', auditController.getLogs);

export default router;
