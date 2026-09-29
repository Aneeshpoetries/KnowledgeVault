import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const requestedEmpId = searchParams.get('employeeId') || undefined;
    const requestedProjId = searchParams.get('projectId') || undefined;

    let targetEmployeeId = requestedEmpId;
    let targetProjectId = requestedProjId;

    if (user) {
      if (user.role === 'EMPLOYEE' || user.role === 'NEW_EMPLOYEE') {
        targetEmployeeId = user.employeeId;
        if (requestedProjId && !user.projectIds.includes(requestedProjId)) {
          targetProjectId = user.projectIds[0];
        }
      } else if (user.role === 'MANAGER') {
        if (requestedEmpId && !user.directReportIds.includes(requestedEmpId) && requestedEmpId !== user.employeeId) {
          targetEmployeeId = user.directReportIds[0] || user.employeeId;
        }
      }
    }

    // Calculate live mathematical coverage
    const coverageReport = await calculateCoverageForEmployee(targetEmployeeId, targetProjectId);

    // Filter at-risk employees by user role scope
    let empWhere: any = {
      OR: [{ riskLevel: 'CRITICAL' }, { riskLevel: 'HIGH' }, { concentrationRatio: { gte: 50.0 } }],
    };

    if (user && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        empWhere = {
          AND: [empWhere, { id: { in: [...user.directReportIds, user.employeeId || ''] } }],
        };
      } else {
        empWhere = {
          AND: [empWhere, { id: user.employeeId || 'none' }],
        };
      }
    }

    const atRiskEmployees = await prisma.employee.findMany({
      where: empWhere,
      include: {
        projects: { include: { project: true } },
      },
      orderBy: { concentrationRatio: 'desc' },
    });

    // Filter projects by user role scope
    let projectWhere: any = {};
    if (user && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        projectWhere = {
          OR: [
            { id: { in: user.projectIds } },
            { department: user.department || 'Core Engineering' },
          ],
        };
      } else {
        projectWhere = {
          id: { in: user.projectIds.length > 0 ? user.projectIds : ['none'] },
        };
      }
    }

    const projects = await prisma.project.findMany({
      where: projectWhere,
      orderBy: { coverageScore: 'asc' },
    });

    return NextResponse.json({
      ...coverageReport,
      atRiskEmployees,
      projects,
      scope: {
        role: user?.role || 'ADMIN',
        targetEmployeeId,
        targetProjectId,
      },
    });
  } catch (error) {
    console.error('Failed to calculate coverage:', error);
    return NextResponse.json({ error: 'Failed to compute coverage metrics' }, { status: 500 });
  }
}
