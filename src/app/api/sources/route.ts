import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type && type !== 'ALL') where.type = type;
    if (status && status !== 'ALL') where.status = status;

    const sources = await prisma.knowledgeSource.findMany({
      where,
      include: {
        knowledgeItems: {
          select: { id: true, title: true, risk: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Failed to get sources:', error);
    return NextResponse.json({ error: 'Failed to retrieve sources' }, { status: 500 });
  }
}
