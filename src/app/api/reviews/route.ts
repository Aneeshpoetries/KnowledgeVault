import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'This knowledge is outside your workspace.' }, { status: 403 });
    }

    const whereClause: any = {
      status: { in: ['PENDING_REVIEW', 'NEEDS_REVISION'] },
    };

    if (user.role === 'MANAGER') {
      const teamEmployeeIds = [...user.directReportIds, user.employeeId].filter(Boolean) as string[];
      whereClause.OR = [
        { employeeId: { in: teamEmployeeIds } },
        { createdByEmployeeId: { in: teamEmployeeIds } },
        { projectId: { in: user.projectIds } },
      ];
    }

    const items = await prisma.knowledgeItem.findMany({
      where: whereClause,
      include: {
        employee: true,
        createdByEmployee: true,
        project: true,
        source: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ risk: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Failed to fetch review items:', error);
    return NextResponse.json({ error: 'Failed to retrieve review queue' }, { status: 500 });
  }
}
