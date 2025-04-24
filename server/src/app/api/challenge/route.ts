import { NextRequest, NextResponse } from 'next/server';
import { cognitoService } from '@/lib/services/cognito';

function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeName, username, session, newPassword } = body;
    
    if (!challengeName || !username || !session) {
      return NextResponse.json(
        { error: 'Required parameters are missing' }, 
        { status: 400 }
      );
    }
    
    const challengeResponse = await cognitoService.respondToChallenge(challengeName, {
      username,
      session,
      newPassword
    });
    
    if (!challengeResponse.success) {
      return NextResponse.json(
        { error: challengeResponse.error || 'Challenge response failed' },
        { status: 401 }
      );
    }
    
    if (challengeResponse.authResult) {
      const userSession = cognitoService.createSessionFromChallenge(
        username,
        challengeResponse.authResult
      );
      
      return NextResponse.json({
        success: true,
        session: userSession.token
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logError(error, 'challenge-response');
    
    return NextResponse.json(
      { error: 'Challenge response failed', details: (error as Error).message },
      { status: 401 }
    );
  }
}