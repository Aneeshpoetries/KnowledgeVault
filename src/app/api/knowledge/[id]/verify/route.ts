import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const verifierName = user?.name || 'Authorized Lead Reviewer';

    const item = await prisma.knowledgeItem.update({
      where: { id },
      data: {
        freshness: 'FRESH',
        lastVerifiedAt: new Date(),
        verifiedBy: verifierName,
      },
    });

    await prisma.verification.create({
      data: {
        knowledgeItemId: id,
        userId: user?.id || null,
        notes: `Verified as accurate by ${verifierName}`,
      },
    });

    await prisma.activity.create({
      data: {
        type: 'VERIFICATION',
        title: `Knowledge Verified: ${item.title}`,
        description: `Verified by ${verifierName}. Freshness reset to FRESH.`,
        projectId: item.projectId || null,
        employeeId: item.employeeId || null,
        userId: user?.id || null,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Failed to verify knowledge item:', error);
    return NextResponse.json({ error: 'Failed to verify record' }, { status: 500 });
  }
}
