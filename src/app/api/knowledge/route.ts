import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const projectId = searchParams.get('projectId');
    const employeeId = searchParams.get('employeeId');
    const risk = searchParams.get('risk');
    const status = searchParams.get('status') || 'APPROVED';
    const freshness = searchParams.get('freshness');

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }
    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }
    if (employeeId && employeeId !== 'ALL') {
      where.employeeId = employeeId;
    }
    if (risk && risk !== 'ALL') {
      where.risk = risk;
    }
    if (freshness && freshness !== 'ALL') {
      where.freshness = freshness;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
        { tagsJson: { contains: search } },
      ];
    }

    const items = await prisma.knowledgeItem.findMany({
      where,
      include: {
        project: true,
        employee: true,
        source: true,
      },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to fetch knowledge items:', error);
    return NextResponse.json({ error: 'Failed to retrieve knowledge base' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      summary,
      content,
      type,
      risk,
      importance,
      confidence,
      projectId,
      employeeId,
      sourceName,
      tags,
      whyItMatters,
      problems,
      solutions,
      dependencies,
    } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and knowledge type are required' },
        { status: 400 }
      );
    }

    // 1. Create KnowledgeItem
    const item = await prisma.knowledgeItem.create({
      data: {
        title,
        summary: summary || content.slice(0, 150),
        content,
        originalSourceText: content,
        aiInterpretation: `Direct manual record codified into institutional memory.`,
        whyItMatters: whyItMatters || 'Essential operational continuity insight.',
        type,
        risk: risk || 'MEDIUM',
        importance: Number(importance) || 7,
        confidence: Number(confidence) || 0.9,
        status: 'APPROVED',
        freshness: 'FRESH',
        lastVerifiedAt: new Date(),
        verifiedBy: 'Author Verification',
        projectId: projectId || null,
        employeeId: employeeId || null,
        tagsJson: JSON.stringify(tags || []),
        problemsJson: JSON.stringify(problems || []),
        solutionsJson: JSON.stringify(solutions || []),
        dependenciesJson: JSON.stringify(dependencies || []),
      },
      include: {
        project: true,
        employee: true,
      },
    });

    // 2. Generate embedding
    const textToEmbed = `${item.title} ${item.summary} ${item.content} ${item.type}`;
    const vec = await generateEmbedding(textToEmbed);
    await prisma.knowledgeEmbedding.create({
      data: {
        knowledgeItemId: item.id,
        vectorJson: JSON.stringify(vec),
        model: 'text-embedding-3-small',
        dimensions: vec.length,
      },
    });

    // 3. Connect to Graph
    if (projectId) {
      await prisma.knowledgeRelationship.create({
        data: {
          sourceEntityId: projectId,
          sourceEntityType: 'PROJECT',
          sourceLabel: item.project?.name || 'Project',
          targetEntityId: item.id,
          targetEntityType: 'KNOWLEDGE',
          targetLabel: item.title,
          relationshipType: 'DOCUMENTS',
          weight: 0.9,
        },
      });
    }

    if (employeeId) {
      await prisma.knowledgeRelationship.create({
        data: {
          sourceEntityId: employeeId,
          sourceEntityType: 'EMPLOYEE',
          sourceLabel: item.employee?.name || 'Employee',
          targetEntityId: item.id,
          targetEntityType: 'KNOWLEDGE',
          targetLabel: item.title,
          relationshipType: 'OWNS',
          weight: 0.95,
        },
      });
    }

    // 4. Log Activity
    await prisma.activity.create({
      data: {
        type: 'EXTRACTION',
        title: `New Knowledge Added: ${item.title}`,
        description: `Manual knowledge capture of type ${item.type} (Risk: ${item.risk}).`,
        employeeId: employeeId || null,
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Failed to create knowledge item:', error);
    return NextResponse.json({ error: 'Failed to create knowledge item' }, { status: 500 });
  }
}
