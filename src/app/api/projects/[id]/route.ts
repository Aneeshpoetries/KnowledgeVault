import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        employees: { include: { employee: true } },
        technologies: { include: { technology: true } },
        knowledgeItems: {
          include: { employee: true, source: true },
          orderBy: { createdAt: 'desc' },
        },
        knowledgeGaps: { where: { status: 'OPEN' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 8 },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Dynamic coverage breakdown for this project
    const coverageReport = await calculateCoverageForEmployee(undefined, project.id);

    // Get graph relationships connected to this project
    const relationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [{ sourceEntityId: project.id }, { targetEntityId: project.id }],
      },
    });

    return NextResponse.json({
      project,
      coverageReport,
      relationships,
    });
  } catch (error) {
    console.error('Failed to get project detail:', error);
    return NextResponse.json({ error: 'Failed to retrieve project detail' }, { status: 500 });
  }
}
