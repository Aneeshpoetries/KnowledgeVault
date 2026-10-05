import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTargetedQuestionsForGap } from '@/lib/ai/gaps';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const impact = searchParams.get('impact');
    const projectId = searchParams.get('projectId');

    const filterWhere: any = { status: 'OPEN' };
    if (category && category !== 'ALL') filterWhere.category = category;
    if (impact && impact !== 'ALL') filterWhere.impact = impact;
    if (projectId && projectId !== 'ALL') filterWhere.projectId = projectId;

    let roleScopeWhere: any = {};
    if (user && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        roleScopeWhere = {
          OR: [
            { employeeId: { in: [...user.directReportIds, user.employeeId || ''] } },
            { projectId: { in: user.projectIds } },
            { project: { department: user.department || 'Core Engineering' } },
          ],
        };
      } else {
        // EMPLOYEE or NEW_EMPLOYEE
        roleScopeWhere = {
          OR: [
            { employeeId: user.employeeId || 'none' },
            { projectId: { in: user.projectIds.length > 0 ? user.projectIds : ['none'] } },
          ],
        };
      }
    }

    const gaps = await prisma.knowledgeGap.findMany({
      where: {
        AND: [filterWhere, roleScopeWhere],
      },
      include: {
        project: true,
        employee: true,
      },
      orderBy: [{ impact: 'desc' }, { detectedAt: 'desc' }],
    });

    return NextResponse.json({ gaps }, {
      headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=30' },
    });
  } catch (error) {
    console.error('Failed to fetch knowledge gaps:', error);
    return NextResponse.json({ error: 'Failed to retrieve knowledge gaps' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gapId } = body;

    const gap = await prisma.knowledgeGap.findUnique({
      where: { id: gapId },
      include: { project: true },
    });

    if (!gap) {
      return NextResponse.json({ error: 'Gap not found' }, { status: 404 });
    }

    // Generate dynamic targeted questions via LLM
    const generatedQuestions = await generateTargetedQuestionsForGap(
      gap.title,
      gap.category,
      gap.project?.description || gap.description
    );

    // Save questions into gap
    await prisma.knowledgeGap.update({
      where: { id: gapId },
      data: {
        suggestedQuestionsJson: JSON.stringify(generatedQuestions.map((q: any) => q.question)),
      },
    });

    return NextResponse.json({ success: true, questions: generatedQuestions });
  } catch (error) {
    console.error('Failed to generate gap questions:', error);
    return NextResponse.json({ error: 'Failed to generate AI questions' }, { status: 500 });
  }
}
