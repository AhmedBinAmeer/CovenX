import { Router } from 'express';
import { ClauseController } from '../controllers/clause.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();
const clauseController = new ClauseController();

router.use(authenticateJWT);
router.get('/', clauseController.listClauses);
router.post('/', clauseController.createClause);

export default router;
