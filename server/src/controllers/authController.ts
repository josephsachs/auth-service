// src/controllers/authController.ts
import { Request, Response } from 'express';
import { logError } from '@/middleware';
import { cognitoService, isChallengeResult } from '@/services/cognito';
import { generateCsrfToken } from '@/services/session/sessionFunctions';

export async function getCsrfToken(req: Request, res: Response): Promise<void> {
  const csrfToken = generateCsrfToken();
  
  res.cookie('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 * 1000 // 1 hour in milliseconds
  });
  
  res.json({ csrfToken });
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }
    
    const authResult = await cognitoService.authenticateUser(username, password);
    
    if (isChallengeResult(authResult)) {
      res.json({
        success: true,
        challengeName: authResult.challengeName,
        session: authResult.session,
        challengeParams: authResult.challengeParams
      });
      return;
    }
    
    const session = cognitoService.createSession({
      userId: authResult.userId,
      email: authResult.userId, // Using userId as email placeholder
      tokens: {
        accessToken: authResult.accessToken || '',
        idToken: authResult.idToken || '',
        refreshToken: authResult.refreshToken || ''
      },
      expiresIn: authResult.expiresIn || 3600
    });
    
    res.clearCookie('csrf_token');
    res.json({ success: true, session: session.token });
    
  } catch (error) {
    logError(error, 'login');
    res.status(401).json({ error: 'Authentication failed' });
  }
}