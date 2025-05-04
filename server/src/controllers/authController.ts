import { Request, Response } from 'express';
import { logError } from '@/middleware';
import { cognitoService, isChallengeResult } from '@/services/cognito';
import { generateCsrfToken } from '@/services/session/sessionFunctions';
import { 
  extractCognitoErrorName, 
  getAuthErrorMessage, 
  getErrorStatusCode 
} from '@/services/cognito/errorHandling';

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
      res.status(400).json({ 
        success: false,
        error: 'Username and password are required' 
      });
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
      email: authResult.userId,
      tokens: {
        accessToken: authResult.accessToken || '',
        idToken: authResult.idToken || '',
        refreshToken: authResult.refreshToken || ''
      },
      expiresIn: authResult.expiresIn || 3600
    });
    
    res.clearCookie('csrf_token');
    res.json({ success: true, session: session.token });
    
  } catch (error: any) {
    logError(error, 'login');
    
    const errorName = extractCognitoErrorName(error);
    const friendlyErrorMessage = getAuthErrorMessage(errorName);
    const statusCode = getErrorStatusCode(errorName);
    
    console.log(`Login error mapped: ${errorName} -> "${friendlyErrorMessage}" (${statusCode})`);
    
    res.status(statusCode).json({
      success: false,
      error: friendlyErrorMessage
    });
  }
}

export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      res.status(400).json({ error: 'Username, password, and email are required' });
      return;
    }
    
    const registrationResult = await cognitoService.registerUser(username, password, email);
    
    res.json({ 
      success: true, 
      message: 'User registered successfully',
      userSub: registrationResult.userSub
    });
    
  } catch (error: any) {
    logError(error, 'registration');

    const errorName = error.name || (error.__type ? error.__type.split('#').pop() : '');
    const errorMessage = error.message || 'Registration failed';
    
    if (errorName === 'InvalidPasswordException') {
      res.status(400).json({ 
        error: 'Invalid password', 
        details: errorMessage 
      });
      return;
    }
    
    if (errorName === 'UsernameExistsException') {
      res.status(409).json({ 
        error: 'Username already exists',
        details: errorMessage
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: errorMessage
    });
  }
}