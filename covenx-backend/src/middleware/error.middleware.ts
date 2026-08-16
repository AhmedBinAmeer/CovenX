import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error Middleware]', err.stack || err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const response: ApiResponse = {
    success: false,
    data: null,
    error: err.message || 'Internal Server Error',
  };

  res.status(statusCode).json(response);
};
