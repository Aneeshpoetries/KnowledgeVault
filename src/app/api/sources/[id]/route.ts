import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await prisma.knowledgeSource.findUnique({
      where: { id },
      include: {
        knowledgeItems: {
          include: { project: true, employee: true },
          orderBy: { importance: 'desc' },
        },
        chunks: { take: 10 },
      },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Failed to get source detail:', error);
    return NextResponse.json({ error: 'Failed to retrieve source detail' }, { status: 500 });
  }
}
