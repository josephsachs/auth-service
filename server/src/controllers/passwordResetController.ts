// src/controllers/passwordResetController.ts
import { Request, Response } from 'express';
import { logError } from '@/middleware';
import { passwordResetService } from '@/services/cognito';

export async function initiatePasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;
    
    if (!username) {
      res.status(400).json({ error: 'Username or email is required' });
      return;
    }
    
    const result = await passwordResetService.initiatePasswordReset(username);
    
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    
    res.json({ success: true, message: result.message });
    
  } catch (error) {
    logError(error, 'password-reset-initiate');
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
}

export async function confirmPasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const { username, confirmationCode, newPassword } = req.body;
    
    if (!username || !confirmationCode || !newPassword) {
      res.status(400).json({ error: 'Username, confirmation code, and new password are required' });
      return;
    }
    
    const result = await passwordResetService.confirmPasswordReset(
      username,
      confirmationCode,
      newPassword
    );
    
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    
    res.json({ success: true, message: result.message });
    
  } catch (error) {
    logError(error, 'password-reset-confirm');
    res.status(500).json({ error: 'Failed to confirm password reset' });
  }
}