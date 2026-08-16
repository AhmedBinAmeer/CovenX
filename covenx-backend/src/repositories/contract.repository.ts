import { BaseRepository } from './base.repository';
import { ContractModel, IContract } from '../models/Contract.model';

export class ContractRepository extends BaseRepository<IContract> {
  constructor() {
    super(ContractModel);
  }

  async findByAuthor(authorId: string): Promise<IContract[]> {
    return await this.findAll({ authorId });
  }

  async findWithFilters(filters: {
    status?: string;
    type?: string;
    department?: string;
    search?: string;
  }): Promise<IContract[]> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.department) query.department = filters.department;

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { contractNumber: { $regex: filters.search, $options: 'i' } },
        { parties: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return await this.model.find(query).sort({ updatedAt: -1 }).exec();
  }

  async getExecutiveMetrics(): Promise<any> {
    const totalCount = await this.model.countDocuments();
    const activeCount = await this.model.countDocuments({ status: 'EXECUTED' });
    const pendingApprovalCount = await this.model.countDocuments({ status: 'PENDING_REVIEW' });
    const draftCount = await this.model.countDocuments({ status: 'DRAFT' });
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoonCount = await this.model.countDocuments({
      expiryDate: { $gte: new Date(), $lte: thirtyDaysFromNow },
      status: 'EXECUTED',
    });

    const totalValueAgg = await this.model.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$value' } } },
    ]);
    const totalValue = totalValueAgg[0]?.totalValue || 0;

    const departmentBreakdown = await this.model.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
    ]);

    const statusBreakdown = await this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return {
      totalContracts: totalCount,
      activeContracts: activeCount,
      pendingApprovals: pendingApprovalCount,
      draftContracts: draftCount,
      expiringSoon: expiringSoonCount,
      totalContractValue: totalValue,
      departmentBreakdown,
      statusBreakdown,
    };
  }
}
