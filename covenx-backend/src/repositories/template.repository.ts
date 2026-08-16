import { BaseRepository } from './base.repository';
import { TemplateModel, ITemplate } from '../models/Template.model';

export class TemplateRepository extends BaseRepository<ITemplate> {
  constructor() {
    super(TemplateModel);
  }

  async findActiveTemplates(): Promise<ITemplate[]> {
    return await this.findAll({ isActive: true });
  }
}
