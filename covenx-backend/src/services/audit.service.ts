import { AuditRepository } from '../repositories/audit.repository.js';
import { IAuditLog } from '../models/AuditLog.model.js';

export class AuditService {
  private auditRepository: AuditRepository;

  constructor() {
    this.auditRepository = new AuditRepository();
  }

  async getContractLogs(contractId: string): Promise<IAuditLog[]> {
    return await this.auditRepository.findByContract(contractId);
  }

  async getRecentAuditLogs(): Promise<IAuditLog[]> {
    return await this.auditRepository.findRecentLogs(50);
  }
}
