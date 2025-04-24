import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Parse comma-separated origins from environment variable
function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  return originsEnv.split(',').filter(Boolean).map(origin => origin.trim());
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  let response = NextResponse.next();
  
  if (request.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 200 });
  }
  
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    // Set CORS headers on the response
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    if (request.method === 'OPTIONS') {
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
  }
  
  console.log(`CORS middleware for ${request.method} ${request.nextUrl.pathname} from origin: ${origin}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};