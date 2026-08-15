import { Request, Response, NextFunction } from 'express';
import { ClauseService } from '../services/clause.service.js';
import { ApiResponse } from '../types/index.js';

export class ClauseController {
  private clauseService: ClauseService;

  constructor() {
    this.clauseService = new ClauseService();
  }

  listClauses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clauses = await this.clauseService.getAllClauses();
      const response: ApiResponse = {
        success: true,
        data: clauses,
        error: null,
      };
      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  createClause = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clause = await this.clauseService.createClause(req.body);
      const response: ApiResponse = {
        success: true,
        data: clause,
        error: null,
      };
      res.status(201).json(response);
    } catch (error: any) {
      next(error);
    }
  };
}
