import { Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service';
import { AuthenticatedRequest, ApiResponse } from '../types/index';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  createContract = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorId = req.user?.id || 'usr_architect';
      const authorName = req.user?.email || 'System Architect';
      const contract = await this.contractService.createContract({
        ...req.body,
        authorId,
        authorName,
      });

      const response: ApiResponse = {
        success: true,
        data: contract,
        error: null,
      };

      res.status(201).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  getContract = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contract = await this.contractService.getContractById(id);

      if (!contract) {
        const response: ApiResponse = {
          success: false,
          data: null,
          error: 'Contract not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: contract,
        error: null,
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  listContracts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, type, department, search } = req.query;
      const contracts = await this.contractService.listContracts({
        status: status as string,
        type: type as string,
        department: department as string,
        search: search as string,
      });

      const response: ApiResponse = {
        success: true,
        data: contracts,
        error: null,
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  updateContentAndVersion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content, changeSummary } = req.body;
      const actorId = req.user?.id || 'usr_architect';
      const updatedBy = req.user?.email || 'System Architect';

      const updated = await this.contractService.updateContentAndVersion(
        id,
        title,
        content,
        updatedBy,
        actorId,
        changeSummary
      );

      if (!updated) {
        res.status(404).json({ success: false, data: null, error: 'Contract not found' });
        return;
      }

      res.status(200).json({ success: true, data: updated, error: null });
    } catch (error: any) {
      next(error);
    }
  };

  submitForApproval = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actorId = req.user?.id || 'usr_architect';
      const actorName = req.user?.email || 'System Architect';

      const updated = await this.contractService.submitForApproval(id, actorId, actorName);
      res.status(200).json({ success: true, data: updated, error: null });
    } catch (error: any) {
      next(error);
    }
  };

  approveStep = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { step, comments } = req.body;
      const approverId = req.user?.id || 'usr_architect';
      const approverName = req.user?.email || 'System Approver';
      const role = req.user?.role || 'LEGAL_REVIEWER';

      const updated = await this.contractService.approveStep(
        id,
        Number(step),
        approverId,
        approverName,
        role,
        comments
      );

      res.status(200).json({ success: true, data: updated, error: null });
    } catch (error: any) {
      next(error);
    }
  };

  signContract = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { signerName, signerEmail } = req.body;
      const actorId = req.user?.id || 'usr_architect';

      const updated = await this.contractService.simulateDigitalSignature(
        id,
        signerName || 'Authorized Signer',
        signerEmail || 'signer@covenx.io',
        actorId
      );

      res.status(200).json({ success: true, data: updated, error: null });
    } catch (error: any) {
      next(error);
    }
  };

  addObligation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actorId = req.user?.id || 'usr_architect';
      const actorName = req.user?.email || 'System Architect';

      const updated = await this.contractService.addObligation(id, req.body, actorId, actorName);
      res.status(201).json({ success: true, data: updated, error: null });
    } catch (error: any) {
      next(error);
    }
  };
}
