import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';
import { getCurrentUser, logAudit } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    if (user.role === 'NEW_EMPLOYEE') {
      return NextResponse.json(
        { error: 'Forbidden: New employees cannot initiate knowledge exit modes.' },
        { status: 403 }
      );
    }

    if (user.role === 'EMPLOYEE' && employeeId !== user.employeeId) {
      return NextResponse.json(
        { error: 'Forbidden: Employees can only initiate Exit Mode for their own profile.' },
        { status: 403 }
      );
    }

    if (
      user.role === 'MANAGER' &&
      !user.directReportIds.includes(employeeId) &&
      employeeId !== user.employeeId
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Managers can only initiate Exit Mode for direct reports.' },
        { status: 403 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        projects: { include: { project: true } },
        knowledgeItems: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if active session already exists
    let session = await prisma.exitSession.findFirst({
      where: {
        employeeId,
        status: 'ACTIVE',
      },
      include: {
        questions: {
          include: { answers: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      // Calculate current coverage
      const coverage = await calculateCoverageForEmployee(employeeId);

      // Create new session
      session = await prisma.exitSession.create({
        data: {
          employeeId,
          status: 'ACTIVE',
          initialCoverage: coverage.overallCoverage,
          initialGaps: coverage.criticalGapsCount || 4,
          itemsRecovered: 0,
          summary: `Exit Mode session initialized for ${employee.name} (${employee.role}). Targeting missing operational troubleshooting and legacy dependencies.`,
        },
        include: {
          questions: {
            include: { answers: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      // Seed initial targeted questions for this session
      await prisma.exitQuestion.createMany({
        data: [
          {
            sessionId: session.id,
            question: 'I found strong documentation around architecture and deployment checklists, but very little about production troubleshooting. What usually breaks during high-volume billing deployment?',
            category: 'Troubleshooting',
            rationale: 'Troubleshooting coverage is currently in the critical zone. Single point of failure recovery.',
            priority: 'CRITICAL',
            order: 1,
          },
          {
            sessionId: session.id,
            question: 'When the Chase Paymentech 3D-Secure gateway times out or hangs, what is the exact failover protocol and which manual command triggers fallback to our secondary processor?',
            category: 'Dependencies',
            rationale: 'Vendor escalation and out-of-band clearance protocol is completely unwritten.',
            priority: 'HIGH',
            order: 2,
          },
          {
            sessionId: session.id,
            question: 'What undocumented edge cases or race conditions exist in the batch settlement script `reconcile_v1.py` that new engineers should avoid modifying without caution?',
            category: 'Edge Cases',
            rationale: 'Reconciliation script heuristics are undocumented.',
            priority: 'HIGH',
            order: 3,
          },
        ],
      });

      // Refetch session with questions
      session = await prisma.exitSession.findUnique({
        where: { id: session.id },
        include: {
          questions: {
            include: { answers: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    // Mark employee as active exit mode
    await prisma.employee.update({
      where: { id: employeeId },
      data: { isExitModeActive: true },
    });

    await logAudit(user, 'START_EXIT_MODE', 'EXIT_SESSION', session?.id, {
      employeeId,
      employeeName: employee.name,
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Failed to start exit mode:', error);
    return NextResponse.json({ error: 'Failed to initialize Exit Mode' }, { status: 500 });
  }
}
