// src/middleware/index.ts
import { Request, Response, NextFunction } from 'express';
import { verifyCsrfToken } from '@/services/session/sessionFunctions';

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

export function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  return originsEnv.split(',').filter(Boolean).map(origin => origin.trim());
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'POST' && req.path === '/api/login') {
    const csrfToken = req.body.csrfToken;
    const storedCsrfToken = req.cookies?.csrf_token;
    
    if (!storedCsrfToken || !csrfToken || !verifyCsrfToken(csrfToken, storedCsrfToken)) {
      res.status(403).json({ error: 'Invalid CSRF token' });
      return;
    }
  }
  
  next();
}