import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';
import { ApiResponse } from '../types/index.js';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { contractId } = req.query;
      let logs;

      if (contractId) {
        logs = await this.auditService.getContractLogs(contractId as string);
      } else {
        logs = await this.auditService.getRecentAuditLogs();
      }

      const response: ApiResponse = {
        success: true,
        data: logs,
        error: null,
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };
}
