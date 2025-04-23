import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Parse comma-separated origins from environment variable
function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || '';
  return originsEnv.split(',').filter(Boolean).map(origin => origin.trim());
}

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // Default response to continue the middleware chain
  let response = NextResponse.next();
  
  // If this is an OPTIONS request (preflight), create a new response
  if (request.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 200 });
  }
  
  // If there's an origin header and it's in our allowed list (or we have a wildcard)
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    // Set CORS headers on the response
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // For preflight requests, set cache headers to avoid repeated OPTIONS calls
    if (request.method === 'OPTIONS') {
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
  }
  
  // For debugging
  console.log(`CORS middleware for ${request.method} ${request.nextUrl.pathname} from origin: ${origin}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  
  return response;
}

// Apply middleware only to API routes
export const config = {
  matcher: '/api/:path*',
};