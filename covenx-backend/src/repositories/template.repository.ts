import { BaseRepository } from './base.repository.js';
import { TemplateModel, ITemplate } from '../models/Template.model.js';

export class TemplateRepository extends BaseRepository<ITemplate> {
  constructor() {
    super(TemplateModel);
  }

  async findActiveTemplates(): Promise<ITemplate[]> {
    return await this.findAll({ isActive: true });
  }
}
