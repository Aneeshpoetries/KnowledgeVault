import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTargetedQuestionsForGap } from '@/lib/ai/gaps';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const impact = searchParams.get('impact');
    const projectId = searchParams.get('projectId');

    const where: any = { status: 'OPEN' };
    if (category && category !== 'ALL') where.category = category;
    if (impact && impact !== 'ALL') where.impact = impact;
    if (projectId && projectId !== 'ALL') where.projectId = projectId;

    const gaps = await prisma.knowledgeGap.findMany({
      where,
      include: {
        project: true,
        employee: true,
      },
      orderBy: [{ impact: 'desc' }, { detectedAt: 'desc' }],
    });

    return NextResponse.json({ gaps });
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
