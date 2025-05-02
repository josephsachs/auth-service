// src/services/session/sessionService.ts
import { getSession, deleteSession } from '@/utils/db';

export interface SessionData {
  createdAt: number;
  expiresAt: number;
}

export interface VerifySessionResult {
  valid: boolean;
  userId?: string;
  email?: string;
  sessionData?: SessionData;
  error?: string;
}

export interface UserData {
  userId: string;
  email: string;
  [key: string]: any;
}

export async function verifySession(token: string): Promise<VerifySessionResult> {
  if (!token) {
    return {
      valid: false,
      error: 'No session token provided'
    };
  }

  try {
    const session = getSession(token);
    
    if (!session) {
      return {
        valid: false,
        error: 'Invalid or expired session'
      };
    }
    
    return {
      valid: true,
      userId: session.userId,
      email: session.email,
      sessionData: {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      valid: false,
      error: 'Session verification failed'
    };
  }
}

export async function getUserData(userId: string): Promise<UserData> {
  // This is a placeholder - in a real implementation, 
  // you would call Cognito to get user attributes
  
  return {
    userId,
    email: userId // Using userId as email placeholder
  };
}

export function endSession(token: string): boolean {
  try {
    return deleteSession(token);
  } catch (error) {
    console.error('Session deletion error:', error);
    return false;
  }
}

export const sessionService = {
  verifySession,
  getUserData,
  endSession
};