import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.knowledgeItem.findUnique({
      where: { id },
      include: {
        project: true,
        employee: true,
        source: true,
        verifications: {
          include: { user: true },
          orderBy: { verifiedAt: 'desc' },
        },
        conflictA: { include: { itemB: true } },
        conflictB: { include: { itemA: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    }

    // Also get related graph relationships
    const relationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [{ sourceEntityId: id }, { targetEntityId: id }],
      },
    });

    return NextResponse.json({ item, relationships });
  } catch (error) {
    console.error('Failed to get knowledge item detail:', error);
    return NextResponse.json({ error: 'Failed to retrieve record' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.knowledgeItem.update({
      where: { id },
      data: {
        title: body.title,
        summary: body.summary,
        content: body.content,
        type: body.type,
        risk: body.risk,
        importance: body.importance !== undefined ? Number(body.importance) : undefined,
        status: body.status,
        whyItMatters: body.whyItMatters,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Failed to update knowledge item:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.knowledgeItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete knowledge item:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
