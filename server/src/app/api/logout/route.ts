import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/services/session/sessionService';

//export const dynamic = 'force-dynamic';

function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session } = body;
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No session token provided' },
        { status: 400 }
      );
    }
    
    const success = sessionService.endSession(session);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to end session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logError(error, 'logout');
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}