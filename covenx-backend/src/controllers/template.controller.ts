import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service';
import { ApiResponse } from '../types/index';

export class TemplateController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  listTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.templateService.getAllTemplates();
      const response: ApiResponse = {
        success: true,
        data: templates,
        error: null,
      };
      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await this.templateService.createTemplate(req.body);
      const response: ApiResponse = {
        success: true,
        data: template,
        error: null,
      };
      res.status(201).json(response);
    } catch (error: any) {
      next(error);
    }
  };
}
