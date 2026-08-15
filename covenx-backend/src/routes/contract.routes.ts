import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();
const contractController = new ContractController();

router.use(authenticateJWT);

router.post('/', contractController.createContract);
router.get('/', contractController.listContracts);
router.get('/:id', contractController.getContract);
router.put('/:id', contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

export default router;
