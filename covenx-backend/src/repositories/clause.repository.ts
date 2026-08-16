import { BaseRepository } from './base.repository';
import { ClauseModel, IClause } from '../models/Clause.model';

export class ClauseRepository extends BaseRepository<IClause> {
  constructor() {
    super(ClauseModel);
  }

  async findByCategory(category: string): Promise<IClause[]> {
    return await this.findAll({ category });
  }
}
