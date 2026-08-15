import { ContractRepository } from '../repositories/contract.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class AnalyticsService {
  private contractRepository: ContractRepository;
  private auditRepository: AuditRepository;

  constructor() {
    this.contractRepository = new ContractRepository();
    this.auditRepository = new AuditRepository();
  }

  async getExecutiveDashboardMetrics() {
    const metrics = await this.contractRepository.getExecutiveMetrics();
    const recentActivity = await this.auditRepository.findRecentLogs(10);

    return {
      ...metrics,
      recentActivity,
    };
  }
}
