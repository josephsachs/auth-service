import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/cognito';
import { createUserSession, generateCsrfToken, verifyCsrfToken } from '@/lib/session';

function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
}

export async function GET() {
  const csrfToken = generateCsrfToken();
  
  const response = NextResponse.json({ csrfToken });
  
  response.cookies.set('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1 hour
  });
  
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, csrfToken } = body;
    
    const storedCsrfToken = request.cookies.get('csrf_token')?.value;
    if (!storedCsrfToken || !csrfToken || !verifyCsrfToken(csrfToken, storedCsrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' }, 
        { status: 403 }
      );
    }
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' }, 
        { status: 400 }
      );
    }
    
    const authResult = await authenticateUser(username, password);
    
    const session = createUserSession(
      authResult.userId,
      authResult.userId, // Using userId as email placeholder
      {
        accessToken: authResult.accessToken || '',
        idToken: authResult.idToken || '',
        refreshToken: authResult.refreshToken || ''
      },
      authResult.expiresIn
    );
    
    const response = NextResponse.json({ session: session.token });
    
    response.cookies.delete('csrf_token');
    
    return response;
    
  } catch (error) {
    logError(error, 'login');
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}