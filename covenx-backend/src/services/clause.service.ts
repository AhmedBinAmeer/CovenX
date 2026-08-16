import { ClauseRepository } from '../repositories/clause.repository';
import { IClause } from '../models/Clause.model';

export class ClauseService {
  private clauseRepository: ClauseRepository;

  constructor() {
    this.clauseRepository = new ClauseRepository();
  }

  async getAllClauses(): Promise<IClause[]> {
    return await this.clauseRepository.findAll();
  }

  async createClause(data: Partial<IClause>): Promise<IClause> {
    return await this.clauseRepository.create(data);
  }
}
