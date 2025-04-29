// src/services/session/sessionFunctions.ts
import { nanoid } from 'nanoid';
import { createSession, getSession, deleteSession, CognitoTokens } from '@/utils/db';

export function generateSessionToken(): string {
  return nanoid(32);
}

export function createUserSession(
  userId: string,
  email: string,
  cognitoTokens: CognitoTokens,
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
  return nanoid(16);
}

export function verifyCsrfToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}