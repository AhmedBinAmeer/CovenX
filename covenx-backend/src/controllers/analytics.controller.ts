import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '../types/index.js';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.analyticsService.getExecutiveDashboardMetrics();
      const response: ApiResponse = {
        success: true,
        data: metrics,
        error: null,
      };
      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };
}
