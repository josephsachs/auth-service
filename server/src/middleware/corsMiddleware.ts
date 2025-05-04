// src/middleware/corsMiddleware.ts

export function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  return originsEnv.split(',').filter(Boolean).map(origin => origin.trim());
}

export function corsOptionsDelegate(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  const allowedOrigins = getAllowedOrigins();
  if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}