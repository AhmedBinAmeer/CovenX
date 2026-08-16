import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const templateController = new TemplateController();

router.use(authenticateJWT);
router.get('/', templateController.listTemplates);
router.post('/', templateController.createTemplate);

export default router;
