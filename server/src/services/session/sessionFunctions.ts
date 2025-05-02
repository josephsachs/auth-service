// src/services/session/sessionFunctions.ts
import { v4 as uuidv4 } from 'uuid';
import { createSession, getSession, deleteSession } from '../../utils/db';

export function generateSessionToken(): string {
  return uuidv4();
}

export function createUserSession(
  userId: string,
  email: string,
  cognitoTokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  },
  expiresInSeconds: number = 1200
) {
  const token = generateSessionToken();
  return createSession(token, userId, email, cognitoTokens, expiresInSeconds);
}

export function validateSession(token: string) {
  return getSession(token);
}

export function endSession(token: string): boolean {
  return deleteSession(token);
}

export function generateCsrfToken(): string {
  return uuidv4();
}

export function verifyCsrfToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}