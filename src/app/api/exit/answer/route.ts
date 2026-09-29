import { NextRequest, NextResponse } from 'next/server';
import { processExitAnswerAndExtractKnowledge } from '@/lib/ai/exit-interview';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, questionId, answer } = body;

    if (!sessionId || !questionId || !answer || answer.trim().length === 0) {
      return NextResponse.json(
        { error: 'sessionId, questionId, and non-empty answer are required' },
        { status: 400 }
      );
    }

    // Process answer through real AI pipeline
    const result = await processExitAnswerAndExtractKnowledge(sessionId, questionId, answer.trim());

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Failed to process exit interview answer:', error);
    return NextResponse.json(
      { error: 'Failed to process employee answer' },
      { status: 500 }
    );
  }
}
