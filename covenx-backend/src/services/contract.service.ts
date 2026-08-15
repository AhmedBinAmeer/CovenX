import { ContractRepository } from '../repositories/contract.repository.js';
import { IContract } from '../models/Contract.model.js';
import { ContractStatus } from '../types/index.js';

export class ContractService {
  private contractRepository: ContractRepository;

  constructor() {
    this.contractRepository = new ContractRepository();
  }

  async createContract(title: string, content: string, value: number, authorId: string): Promise<IContract> {
    return await this.contractRepository.create({
      title,
      content,
      value,
      authorId: authorId as any,
      status: ContractStatus.DRAFT,
    });
  }

  async getContractById(id: string): Promise<IContract | null> {
    return await this.contractRepository.findById(id);
  }

  async getContractsByAuthor(authorId: string): Promise<IContract[]> {
    return await this.contractRepository.findByAuthor(authorId);
  }

  async getAllContracts(): Promise<IContract[]> {
    return await this.contractRepository.findAll();
  }

  async updateContract(id: string, updateData: Partial<IContract>): Promise<IContract | null> {
    return await this.contractRepository.update(id, updateData);
  }

  async deleteContract(id: string): Promise<boolean> {
    return await this.contractRepository.delete(id);
  }
}
