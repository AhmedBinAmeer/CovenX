import { ContractRepository } from '../repositories/contract.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { getRedisClient } from '../config/redis.js';

export class AnalyticsService {
  private contractRepository: ContractRepository;
  private auditRepository: AuditRepository;

  constructor() {
    this.contractRepository = new ContractRepository();
    this.auditRepository = new AuditRepository();
  }

  async getExecutiveDashboardMetrics() {
    const redis = getRedisClient();
    const cacheKey = 'covenx:analytics:dashboard';

    if (redis && redis.isOpen) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('[Redis] Cache read error, falling back to MongoDB query');
      }
    }

    const metrics = await this.contractRepository.getExecutiveMetrics();
    const recentActivity = await this.auditRepository.findRecentLogs(10);
    const result = { ...metrics, recentActivity };

    if (redis && redis.isOpen) {
      try {
        await redis.setEx(cacheKey, 60, JSON.stringify(result)); // 60 seconds TTL cache
      } catch (err) {
        console.warn('[Redis] Cache write error');
      }
    }

    return result;
  }
}
