import { BaseRepository } from './base.repository.js';
import { AuditLogModel, IAuditLog } from '../models/AuditLog.model.js';

export class AuditRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLogModel);
  }

  async findByContract(contractId: string): Promise<IAuditLog[]> {
    return await this.model.find({ contractId }).sort({ timestamp: -1 }).exec();
  }

  async findRecentLogs(limit: number = 50): Promise<IAuditLog[]> {
    return await this.model.find().sort({ timestamp: -1 }).limit(limit).exec();
  }
}
