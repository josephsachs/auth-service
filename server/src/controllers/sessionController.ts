// src/controllers/sessionController.ts
import { Request, Response } from 'express';
import { logError } from '@/middleware';
import { sessionService } from '@/services/session/sessionService';

export async function verifySession(req: Request, res: Response): Promise<void> {
  try {
    const { session } = req.body;
    
    if (!session) {
      res.status(400).json({ valid: false, error: 'No session token provided' });
      return;
    }
    
    const result = await sessionService.verifySession(session);
    
    if (!result.valid) {
      res.status(401).json({ valid: false, error: result.error || 'Invalid session' });
      return;
    }
    
    const userData = await sessionService.getUserData(result.userId!);
    
    res.json({
      valid: true,
      user: {
        id: result.userId,
        ...userData
      },
      session: {
        ...result.sessionData
      }
    });
    
  } catch (error) {
    logError(error, 'verify');
    res.status(500).json({ valid: false, error: 'Session verification failed' });
  }
}

export async function logoutUser(req: Request, res: Response): Promise<void> {
  try {
    const { session } = req.body;
    
    if (!session) {
      res.status(400).json({ success: false, error: 'No session token provided' });
      return;
    }
    
    const success = sessionService.endSession(session);
    
    if (!success) {
      res.status(500).json({ success: false, error: 'Failed to end session' });
      return;
    }
    
    res.json({ success: true });
    
  } catch (error) {
    logError(error, 'logout');
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
}