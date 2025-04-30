// src/controllers/challengeController.ts
import { Request, Response } from 'express';
import { logError } from '@/middleware';
import { cognitoService } from '@/services/cognito';

export async function respondToChallenge(req: Request, res: Response): Promise<void> {
  try {
    const { challengeName, username, session, newPassword } = req.body;
    
    if (!challengeName || !username || !session) {
      res.status(400).json({ error: 'Required parameters are missing' });
      return;
    }
    
    const challengeResponse = await cognitoService.respondToChallenge(challengeName, {
      username,
      session,
      newPassword
    });
    
    if (!challengeResponse.success) {
      res.status(401).json({ error: challengeResponse.error || 'Challenge response failed' });
      return;
    }
    
    if (challengeResponse.authResult) {
      const userSession = cognitoService.createSessionFromChallenge(
        username,
        challengeResponse.authResult
      );
      
      res.json({
        success: true,
        session: userSession.token
      });
      return;
    }
    
    res.json({ success: true });
    
  } catch (error) {
    logError(error, 'challenge-response');
    res.status(401).json({
      error: 'Challenge response failed',
      details: (error as Error).message
    });
  }
}