import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/services/session/sessionService';

function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session } = body;
    
    if (!session) {
      return NextResponse.json(
        { valid: false, error: 'No session token provided' },
        { status: 400 }
      );
    }
    
    const result = await sessionService.verifySession(session);
    
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error || 'Invalid session' },
        { status: 401 }
      );
    }
    const userData = await sessionService.getUserData(result.userId!);
    
    return NextResponse.json({
      valid: true,
      user: {
        id: result.userId,
        //email: result.email,
        ...userData
      },
      session: {
        ...result.sessionData
      }
    });
    
  } catch (error) {
    logError(error, 'verify');
    
    return NextResponse.json(
      { valid: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}