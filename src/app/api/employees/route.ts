import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        projects: { include: { project: true } },
        technologies: { include: { technology: true } },
        knowledgeItems: { select: { id: true, risk: true, type: true } },
        exitSessions: { where: { status: 'ACTIVE' } },
      },
      orderBy: { concentrationRatio: 'desc' },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Failed to get employees:', error);
    return NextResponse.json({ error: 'Failed to retrieve employees' }, { status: 500 });
  }
}
