import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, logAudit } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'This knowledge is outside your workspace.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, reason } = body as {
      action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
      reason?: string;
    };

    if (!action || !['APPROVE', 'REQUEST_CHANGES', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (APPROVE, REQUEST_CHANGES, REJECT) required' }, { status: 400 });
    }

    if ((action === 'REQUEST_CHANGES' || action === 'REJECT') && (!reason || reason.trim().length === 0)) {
      return NextResponse.json({ error: 'A specific reason is required when requesting changes or rejecting submissions' }, { status: 400 });
    }

    const item = await prisma.knowledgeItem.findUnique({
      where: { id },
      include: {
        employee: true,
        createdByEmployee: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    }

    // Manager can only review items in their team/scope
    if (user.role === 'MANAGER') {
      const teamEmployeeIds = [...user.directReportIds, user.employeeId].filter(Boolean) as string[];
      const isTeamItem =
        (item.employeeId && teamEmployeeIds.includes(item.employeeId)) ||
        (item.createdByEmployeeId && teamEmployeeIds.includes(item.createdByEmployeeId)) ||
        (item.projectId && user.projectIds.includes(item.projectId));

      if (!isTeamItem) {
        return NextResponse.json({ error: 'You only have permission to review submissions from your direct reports or assigned projects.' }, { status: 403 });
      }
    }

    let newStatus = 'APPROVED';
    if (action === 'REQUEST_CHANGES') newStatus = 'NEEDS_REVISION';
    if (action === 'REJECT') newStatus = 'REJECTED';

    // Update KnowledgeItem
    const updated = await prisma.knowledgeItem.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedByEmployeeId: user.employeeId || null,
        reviewedAt: new Date(),
        reviewNotes: reason || null,
        lastVerifiedAt: action === 'APPROVE' ? new Date() : undefined,
        verifiedBy: action === 'APPROVE' ? user.name : undefined,
      },
    });

    // Create KnowledgeReview record
    await prisma.knowledgeReview.create({
      data: {
        knowledgeItemId: item.id,
        reviewerName: user.name,
        reviewerRole: user.role,
        action,
        reason: reason || (action === 'APPROVE' ? 'Approved by manager.' : null),
      },
    });

    // Notify author
    const targetEmployeeId = item.createdByEmployeeId || item.employeeId;
    if (targetEmployeeId) {
      let notifType = 'KNOWLEDGE_APPROVED';
      let notifTitle = 'Knowledge Approved';
      let notifMessage = `${user.name} approved "${item.title}". It is now indexed in organizational memory.`;
      let notifSeverity = 'SUCCESS';

      if (action === 'REQUEST_CHANGES') {
        notifType = 'CHANGES_REQUESTED';
        notifTitle = 'Changes Requested';
        notifMessage = `${user.name} requested changes on "${item.title}": ${reason}`;
        notifSeverity = 'WARNING';
      } else if (action === 'REJECT') {
        notifType = 'KNOWLEDGE_REJECTED';
        notifTitle = 'Knowledge Submission Rejected';
        notifMessage = `${user.name} rejected "${item.title}": ${reason}`;
        notifSeverity = 'CRITICAL';
      }

      await prisma.notification.create({
        data: {
          employeeId: targetEmployeeId,
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          link: `/knowledge/${item.id}`,
          severity: notifSeverity,
        },
      });
    }

    // Record audit log
    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: action === 'APPROVE' ? 'KNOWLEDGE_APPROVE' : action === 'REQUEST_CHANGES' ? 'KNOWLEDGE_REQUEST_CHANGES' : 'KNOWLEDGE_REJECT',
      resourceType: 'KNOWLEDGE',
      resourceId: item.id,
      details: { title: item.title, action, reason },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Failed to process review action:', error);
    return NextResponse.json({ error: 'Failed to process review decision' }, { status: 500 });
  }
}
