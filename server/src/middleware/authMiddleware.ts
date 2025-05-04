// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { sessionService } from '@/services/session/sessionService';
import { logError } from '@/middleware/errorMiddleware';

// Extend the Express Request type to include user information
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  sessionToken?: string;
}

/**
 * Middleware to authenticate requests using HttpOnly cookies
 * Supports both cookie-based auth and token-based auth (fallback)
 */
export async function authenticateRequest(
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const cookieToken = req.cookies?.auth_token;
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    const bodyToken = req.body?.session;
    const token = cookieToken || headerToken || bodyToken;
    
    if (!token) {
      return next();
    }
    
    const result = await sessionService.verifySession(token);
    
    if (result.valid && result.userId) {
      req.userId = result.userId;
      req.userEmail = result.email;
      req.sessionToken = token;
    }
    
    next();
  } catch (error) {
    logError(error, 'auth-middleware');
    next();
  }
}

/**
 * Middleware to require authentication for protected routes
 */
export function requireAuth(
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void {
  if (!req.userId) {
    res.status(401).json({ 
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
    return;
  }
  
  next();
}