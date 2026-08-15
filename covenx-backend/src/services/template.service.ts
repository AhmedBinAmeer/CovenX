import { TemplateRepository } from '../repositories/template.repository.js';
import { ITemplate } from '../models/Template.model.js';

export class TemplateService {
  private templateRepository: TemplateRepository;

  constructor() {
    this.templateRepository = new TemplateRepository();
  }

  async getAllTemplates(): Promise<ITemplate[]> {
    return await this.templateRepository.findActiveTemplates();
  }

  async createTemplate(data: Partial<ITemplate>): Promise<ITemplate> {
    return await this.templateRepository.create(data);
  }
}
