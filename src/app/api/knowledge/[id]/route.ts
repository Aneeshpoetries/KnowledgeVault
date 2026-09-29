import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, logAudit } from '@/lib/auth';
import { canAccessKnowledgeItem, hasPermission } from '@/lib/rbac';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

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

    // Enforce data-level permission
    if (user && !canAccessKnowledgeItem(user, item)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'This knowledge item is outside your workspace access scope.',
        },
        { status: 403 }
      );
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const existing = await prisma.knowledgeItem.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    }

    if (!canAccessKnowledgeItem(user, existing)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this knowledge item.' },
        { status: 403 }
      );
    }

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
        version: { increment: 1 },
      },
    });

    await logAudit(user, 'UPDATE_KNOWLEDGE', 'KNOWLEDGE_ITEM', id, { title: updated.title });

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasPermission(user, 'DELETE_KNOWLEDGE')) {
      return NextResponse.json(
        { error: 'Forbidden: Only managers and administrators can delete knowledge items.' },
        { status: 403 }
      );
    }

    const existing = await prisma.knowledgeItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    }

    if (!canAccessKnowledgeItem(user, existing)) {
      return NextResponse.json({ error: 'Forbidden: Out of scope' }, { status: 403 });
    }

    await prisma.knowledgeItem.delete({
      where: { id },
    });

    await logAudit(user, 'DELETE_KNOWLEDGE', 'KNOWLEDGE_ITEM', id, { title: existing.title });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete knowledge item:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
