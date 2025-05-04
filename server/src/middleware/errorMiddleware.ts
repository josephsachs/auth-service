// src/middleware/errorMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export function logError(error: unknown, context: string): void {
  console.error(`[${context}]`, error);
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.log("ERROR HANDLER RECEIVED:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  logError(err, 'global-error-handler');
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    name: err.name,
    details: err.details || err.errorMessage || (err.response?.data) || err.__type || 'No additional details',
    properties: Object.getOwnPropertyNames(err)
  });
}