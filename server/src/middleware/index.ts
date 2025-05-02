// src/middleware/index.ts
import { Request, Response, NextFunction } from 'express';
import { verifyCsrfToken } from '@/services/session/sessionFunctions';

// Error logging middleware
export function logError(error: unknown, context: string): void {
  console.error(`[${context}]`, error);
}

// Error handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  logError(err, 'global-error-handler');
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

// CORS config helper
export function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  return originsEnv.split(',').filter(Boolean).map(origin => origin.trim());
}

// CSRF protection middleware - updated for /api prefix
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // For POST requests that should have CSRF protection
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