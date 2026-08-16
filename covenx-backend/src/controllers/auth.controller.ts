import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types/index';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      const result = await this.authService.register(name, email, password, role);

      const response: ApiResponse = {
        success: true,
        data: result,
        error: null,
      };

      res.status(201).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        error: null,
      };

      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };
}
