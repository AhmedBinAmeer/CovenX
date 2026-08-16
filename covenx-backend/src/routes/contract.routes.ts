import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();
const contractController = new ContractController();

router.use(authenticateJWT);

router.post('/', contractController.createContract);
router.get('/', contractController.listContracts);
router.get('/:id', contractController.getContract);
router.put('/:id/content', contractController.updateContentAndVersion);
router.post('/:id/submit', contractController.submitForApproval);
router.post('/:id/approve', requireRole(['LEGAL_REVIEWER', 'FINANCE_APPROVER', 'EXECUTIVE', 'ADMIN']), contractController.approveStep);
router.post('/:id/sign', contractController.signContract);
router.post('/:id/obligations', contractController.addObligation);

export default router;
