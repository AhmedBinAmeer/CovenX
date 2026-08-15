import { Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  createContract = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, content, value } = req.body;
      const authorId = req.user?.id || 'anonymous';
      const contract = await this.contractService.createContract(title, content, value, authorId);

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
      const contracts = await this.contractService.getAllContracts();

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

  updateContract = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.contractService.updateContract(id, req.body);

      if (!updated) {
        const response: ApiResponse = {
          success: false,
          data: null,
          error: 'Contract not found or failed to update',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updated,
        error: null,
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  deleteContract = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.contractService.deleteContract(id);

      const response: ApiResponse = {
        success: deleted,
        data: { id, deleted },
        error: deleted ? null : 'Failed to delete contract',
      };

      res.status(deleted ? 200 : 400).json(response);
    } catch (error: any) {
      next(error);
    }
  };
}
