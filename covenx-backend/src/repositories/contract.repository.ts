import { BaseRepository } from './base.repository.js';
import { ContractModel, IContract } from '../models/Contract.model.js';

export class ContractRepository extends BaseRepository<IContract> {
  constructor() {
    super(ContractModel);
  }

  async findByAuthor(authorId: string): Promise<IContract[]> {
    return await this.findAll({ authorId });
  }

  async findByStatus(status: string): Promise<IContract[]> {
    return await this.findAll({ status });
  }
}
