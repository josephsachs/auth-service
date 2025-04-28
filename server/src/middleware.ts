import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Parse comma-separated origins from environment variable
function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  return originsEnv.split(',').filter(Boolean).map(origin => origin.trim());
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Block non-API routes immediately
  if (!pathname.startsWith('/api')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Handle CORS for /api routes
  let response = NextResponse.next();

  if (request.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 200 });
  }

  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    if (request.method === 'OPTIONS') {
      response.headers.set('Access-Control-Max-Age', '86400');
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'], // Match everything except static assets
};
