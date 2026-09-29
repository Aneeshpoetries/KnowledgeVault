import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        projects: { include: { project: true } },
        technologies: { include: { technology: true } },
        knowledgeItems: {
          include: { project: true, source: true },
          orderBy: { createdAt: 'desc' },
        },
        exitSessions: {
          include: { questions: { include: { answers: true } } },
          orderBy: { startedAt: 'desc' },
        },
        knowledgeGaps: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Dynamic coverage breakdown
    const coverageReport = await calculateCoverageForEmployee(id);

    return NextResponse.json({
      employee,
      coverageReport,
    });
  } catch (error) {
    console.error('Failed to get employee profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve employee profile' }, { status: 500 });
  }
}
