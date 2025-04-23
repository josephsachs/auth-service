import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

interface SessionRow {
  token: string;
  user_id: string;
  email: string;
  cognito_access_token: string;
  cognito_id_token: string;
  cognito_refresh_token: string;
  created_at: number;
  expires_at: number;
}

interface SessionData {
  token: string;
  userId: string;
  email: string;
  cognitoTokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  };
  createdAt: number;
  expiresAt: number;
}

// data directory is required
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'sessions.db');
const db = new Database(dbPath);

function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      cognito_access_token TEXT NOT NULL,
      cognito_id_token TEXT NOT NULL,
      cognito_refresh_token TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `;
  
  db.exec(createTableQuery);
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)');
}

initDb();

export function createSession(
  token: string,
  userId: string,
  email: string,
  cognitoTokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  },
  expiresInSeconds: number
) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + expiresInSeconds;
  
  const stmt = db.prepare(`
    INSERT INTO sessions (
      token, 
      user_id, 
      email, 
      cognito_access_token, 
      cognito_id_token, 
      cognito_refresh_token, 
      created_at, 
      expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    token,
    userId,
    email,
    cognitoTokens.accessToken,
    cognitoTokens.idToken,
    cognitoTokens.refreshToken,
    now,
    expiresAt
  );
  
  return {
    token,
    userId,
    email,
    expiresAt
  };
}

export function getSession(token: string): SessionData | null {
  const now = Math.floor(Date.now() / 1000);
  
  const stmt = db.prepare(`
    SELECT 
      token, 
      user_id, 
      email, 
      cognito_access_token, 
      cognito_id_token, 
      cognito_refresh_token, 
      created_at, 
      expires_at 
    FROM sessions 
    WHERE token = ? AND expires_at > ?
  `);
  
  const session = stmt.get(token, now) as SessionRow | undefined;
  
  if (!session) {
    return null;
  }
  
  return {
    token: session.token,
    userId: session.user_id,
    email: session.email,
    cognitoTokens: {
      accessToken: session.cognito_access_token,
      idToken: session.cognito_id_token,
      refreshToken: session.cognito_refresh_token
    },
    createdAt: session.created_at,
    expiresAt: session.expires_at
  };
}

export function deleteSession(token: string) {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  const result = stmt.run(token);
  return result.changes > 0;
}

export function cleanupExpiredSessions() {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at <= ?');
  const result = stmt.run(now);
  return result.changes;
}

export default db;