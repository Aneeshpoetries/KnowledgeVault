import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    // Calculate live mathematical coverage
    const coverageReport = await calculateCoverageForEmployee(employeeId, projectId);

    // Also fetch at-risk employees
    const atRiskEmployees = await prisma.employee.findMany({
      where: {
        OR: [{ riskLevel: 'CRITICAL' }, { riskLevel: 'HIGH' }, { concentrationRatio: { gte: 50.0 } }],
      },
      include: {
        projects: { include: { project: true } },
      },
      orderBy: { concentrationRatio: 'desc' },
    });

    // Also fetch project coverage overview
    const projects = await prisma.project.findMany({
      orderBy: { coverageScore: 'asc' },
    });

    return NextResponse.json({
      ...coverageReport,
      atRiskEmployees,
      projects,
    });
  } catch (error) {
    console.error('Failed to calculate coverage:', error);
    return NextResponse.json({ error: 'Failed to compute coverage metrics' }, { status: 500 });
  }
}
