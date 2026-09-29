import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conflicts = await prisma.knowledgeConflict.findMany({
      include: {
        itemA: { include: { project: true, employee: true } },
        itemB: { include: { project: true, employee: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });

    return NextResponse.json({ conflicts });
  } catch (error) {
    console.error('Failed to get conflicts:', error);
    return NextResponse.json({ error: 'Failed to retrieve conflicts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conflictId, resolutionType, resolutionNotes } = body;

    if (!conflictId || !resolutionType) {
      return NextResponse.json({ error: 'conflictId and resolutionType required' }, { status: 400 });
    }

    const conflict = await prisma.knowledgeConflict.findUnique({
      where: { id: conflictId },
      include: { itemA: true, itemB: true },
    });

    if (!conflict) {
      return NextResponse.json({ error: 'Conflict not found' }, { status: 404 });
    }

    // Resolve based on choice
    let status = 'RESOLVED_BOTH_CONTEXTUAL';
    if (resolutionType === 'A_VERIFIED') {
      status = 'RESOLVED_A';
      await prisma.knowledgeItem.update({
        where: { id: conflict.itemAId },
        data: { freshness: 'FRESH', hasConflict: false, lastVerifiedAt: new Date() },
      });
      await prisma.knowledgeItem.update({
        where: { id: conflict.itemBId },
        data: { freshness: 'STALE', status: 'ARCHIVED', hasConflict: false },
      });
    } else if (resolutionType === 'B_VERIFIED') {
      status = 'RESOLVED_B';
      await prisma.knowledgeItem.update({
        where: { id: conflict.itemBId },
        data: { freshness: 'FRESH', hasConflict: false, lastVerifiedAt: new Date() },
      });
      await prisma.knowledgeItem.update({
        where: { id: conflict.itemAId },
        data: { freshness: 'STALE', status: 'ARCHIVED', hasConflict: false },
      });
    } else {
      // Both with contextual conditions
      status = 'RESOLVED_BOTH_CONTEXTUAL';
      await prisma.knowledgeItem.update({
        where: { id: conflict.itemAId },
        data: { hasConflict: false, reasoning: `Contextual condition: ${resolutionNotes || 'Applies outside billing window'}` },
      });
      await prisma.knowledgeItem.update({
        where: { id: conflict.itemBId },
        data: { hasConflict: false, reasoning: `Contextual condition: ${resolutionNotes || 'Applies strictly during 09:00 - 18:00 EST'}` },
      });
    }

    const updated = await prisma.knowledgeConflict.update({
      where: { id: conflictId },
      data: {
        status,
        resolutionNotes: resolutionNotes || 'Resolved through architectural review.',
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, conflict: updated });
  } catch (error) {
    console.error('Failed to resolve conflict:', error);
    return NextResponse.json({ error: 'Failed to resolve conflict' }, { status: 500 });
  }
}
