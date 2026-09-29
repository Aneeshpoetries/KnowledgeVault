import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;

    // Find all relationships connected to this entity
    const directRelationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [{ sourceEntityId: entityId }, { targetEntityId: entityId }],
      },
    });

    const connectedEntityIds = new Set<string>([entityId]);
    directRelationships.forEach((r) => {
      connectedEntityIds.add(r.sourceEntityId);
      connectedEntityIds.add(r.targetEntityId);
    });

    // Also find second-degree connections among connected nodes
    const allRelationships = await prisma.knowledgeRelationship.findMany({
      where: {
        sourceEntityId: { in: Array.from(connectedEntityIds) },
        targetEntityId: { in: Array.from(connectedEntityIds) },
      },
    });

    return NextResponse.json({
      focusedId: entityId,
      relationships: allRelationships,
      connectedCount: connectedEntityIds.size,
    });
  } catch (error) {
    console.error('Failed to get entity sub-graph:', error);
    return NextResponse.json({ error: 'Failed to retrieve sub-graph' }, { status: 500 });
  }
}
