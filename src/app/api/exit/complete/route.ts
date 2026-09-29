import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await prisma.exitSession.findUnique({
      where: { id: sessionId },
      include: {
        employee: {
          include: {
            projects: { include: { project: true } },
            knowledgeItems: true,
          },
        },
        questions: {
          include: { answers: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentCoverage = await calculateCoverageForEmployee(session.employeeId);

    // Update session status to COMPLETED
    const updatedSession = await prisma.exitSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        finalCoverage: currentCoverage.overallCoverage,
        finalGaps: currentCoverage.criticalGapsCount,
        completedAt: new Date(),
        summary: `Exit knowledge transfer completed for ${session.employee.name}. Recovered ${session.itemsRecovered} tacit operational items. Overall coverage increased from ${Math.round(session.initialCoverage)}% to ${Math.round(currentCoverage.overallCoverage)}%.`,
      },
    });

    // Mark employee exit mode inactive
    await prisma.employee.update({
      where: { id: session.employeeId },
      data: { isExitModeActive: false },
    });

    // Generate comprehensive report payload
    const report = {
      title: `Exit Knowledge Transfer Report: ${session.employee.name}`,
      generatedAt: new Date().toISOString(),
      employee: {
        id: session.employee.id,
        name: session.employee.name,
        role: session.employee.role,
        department: session.employee.department,
        email: session.employee.email,
        bio: session.employee.bio,
      },
      projects: session.employee.projects.map((p) => ({
        id: p.project.id,
        name: p.project.name,
        role: p.role,
      })),
      metrics: {
        coverageBefore: session.initialCoverage,
        coverageAfter: currentCoverage.overallCoverage,
        coverageDelta: Math.round(currentCoverage.overallCoverage - session.initialCoverage),
        initialCriticalGaps: session.initialGaps,
        remainingCriticalGaps: currentCoverage.criticalGapsCount,
        itemsRecovered: session.itemsRecovered,
      },
      categoriesCoverage: currentCoverage.categories,
      interviewTranscript: session.questions.map((q) => ({
        question: q.question,
        category: q.category,
        rationale: q.rationale,
        priority: q.priority,
        answers: q.answers.map((a) => ({
          answer: a.rawAnswer,
          extractedItemsCount: a.extractedItemsCount,
          confidence: a.confidence,
          processedAt: a.processedAt,
        })),
      })),
      recommendedFollowUps: [
        'Schedule a 30-minute peer review of the newly codified failover procedure with the incoming on-call team.',
        'Verify production credentials access for secondary payment gateway bypass.',
        'Deprecate mobile v3.1 clients to eliminate the synthetic idempotency fallback script safely.',
      ],
    };

    return NextResponse.json({
      success: true,
      session: updatedSession,
      report,
    });
  } catch (error) {
    console.error('Failed to complete exit session:', error);
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}
