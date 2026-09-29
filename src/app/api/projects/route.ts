import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        employees: { include: { employee: true } },
        technologies: { include: { technology: true } },
        knowledgeItems: { select: { id: true, risk: true, type: true } },
        knowledgeGaps: { where: { status: 'OPEN' } },
      },
      orderBy: { riskLevel: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to get projects:', error);
    return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 });
  }
}
