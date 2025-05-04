// src/middleware/csrfMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyCsrfToken, generateCsrfToken } from '@/services/session/sessionFunctions';

/**
 * CSRF protection middleware
 */
export function csrfProtection(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  if (req.method === 'POST' && req.path === '/api/login') {
    const csrfToken = req.body.csrfToken;
    const storedCsrfToken = req.cookies?.csrf_token;
    
    if (!storedCsrfToken || !csrfToken || !verifyCsrfToken(csrfToken, storedCsrfToken)) {
      res.status(403).json({ 
        error: 'Invalid CSRF token', 
        code: 'INVALID_CSRF'
      });
      return;
    }
  } else if (req.cookies?.auth_token) {
    const csrfHeader = req.headers['x-csrf-token'];
    
    if (!csrfHeader || typeof csrfHeader !== 'string') {
      res.status(403).json({ 
        error: 'CSRF token required', 
        code: 'MISSING_CSRF'
      });
      return;
    }
    
    const storedCsrfToken = req.cookies?.csrf_token;
    if (!storedCsrfToken || !verifyCsrfToken(csrfHeader.toString(), storedCsrfToken)) {
      res.status(403).json({ 
        error: 'Invalid CSRF token', 
        code: 'INVALID_CSRF'
      });
      return;
    }
  }
  
  next();
}

/**
 * Set CSRF token cookie and return token in response
 */
export function setupCsrfToken(req: Request, res: Response): void {
  const csrfToken = generateCsrfToken();
  
  res.cookie('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.COOKIE_DOMAIN || undefined
  });
  
  res.json({ csrfToken });
}