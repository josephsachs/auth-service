import { nanoid } from 'nanoid';
import { createSession, getSession, deleteSession } from './db';

export function generateSessionToken() {
  return nanoid(32);
}

export function createUserSession(
  userId: string,
  email: string,
  cognitoTokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  },
  expiresInSeconds = 1200
) {
  const token = generateSessionToken();
  return createSession(token, userId, email, cognitoTokens, expiresInSeconds);
}

export function validateSession(token: string) {
  return getSession(token);
}

export function endSession(token: string) {
  return deleteSession(token);
}

export function generateCsrfToken() {
  return nanoid(16);
}

export function verifyCsrfToken(token: string, expectedToken: string) {
  return token === expectedToken;
}