import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const questions = await prisma.exitQuestion.findMany({
      where: { sessionId },
      include: { answers: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to get exit questions:', error);
    return NextResponse.json({ error: 'Failed to retrieve questions' }, { status: 500 });
  }
}
