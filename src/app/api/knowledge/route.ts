import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { getCurrentUser, logAudit } from '@/lib/auth';
import { buildAccessibleKnowledgeWhere, hasPermission } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const accessibleWhere = user
      ? buildAccessibleKnowledgeWhere(user)
      : { status: 'APPROVED', visibility: 'PUBLIC' };

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const projectId = searchParams.get('projectId');
    const employeeId = searchParams.get('employeeId');
    const risk = searchParams.get('risk');
    const status = searchParams.get('status') || 'APPROVED';
    const freshness = searchParams.get('freshness');

    const filterWhere: any = {};

    if (status !== 'ALL') {
      filterWhere.status = status;
    }
    if (type && type !== 'ALL') {
      filterWhere.type = type;
    }
    if (projectId && projectId !== 'ALL') {
      filterWhere.projectId = projectId;
    }
    if (employeeId && employeeId !== 'ALL') {
      filterWhere.employeeId = employeeId;
    }
    if (risk && risk !== 'ALL') {
      filterWhere.risk = risk;
    }
    if (freshness && freshness !== 'ALL') {
      filterWhere.freshness = freshness;
    }

    if (search.trim()) {
      filterWhere.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
        { tagsJson: { contains: search } },
      ];
    }

    const items = await prisma.knowledgeItem.findMany({
      where: {
        AND: [accessibleWhere, filterWhere],
      },
      include: {
        project: true,
        employee: true,
        source: true,
      },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ items }, {
      headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=45' },
    });
  } catch (error) {
    console.error('Failed to fetch knowledge items:', error);
    return NextResponse.json({ error: 'Failed to retrieve knowledge base' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasPermission(user, 'CREATE_KNOWLEDGE')) {
      return NextResponse.json(
        { error: 'You do not have permission to submit knowledge items' },
        { status: 403 }
      );
    }

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
      visibility,
    } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and knowledge type are required' },
        { status: 400 }
      );
    }

    // Role-governed initial status:
    // Admin / Manager can immediately publish (APPROVED), Employee submissions go to PENDING_REVIEW
    const initialStatus =
      user.role === 'ADMIN' || user.role === 'MANAGER'
        ? body.status || 'APPROVED'
        : 'PENDING_REVIEW';

    const authorEmployeeId = user.employeeId || employeeId || null;

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
        status: initialStatus,
        freshness: 'FRESH',
        lastVerifiedAt: initialStatus === 'APPROVED' ? new Date() : null,
        verifiedBy: initialStatus === 'APPROVED' ? user.name : null,
        projectId: projectId || null,
        employeeId: authorEmployeeId,
        createdByEmployeeId: user.employeeId || null,
        visibility: visibility || (user.role === 'ADMIN' ? 'PUBLIC' : 'TEAM'),
        version: 1,
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

    if (authorEmployeeId) {
      await prisma.knowledgeRelationship.create({
        data: {
          sourceEntityId: authorEmployeeId,
          sourceEntityType: 'EMPLOYEE',
          sourceLabel: item.employee?.name || user.name || 'Employee',
          targetEntityId: item.id,
          targetEntityType: 'KNOWLEDGE',
          targetLabel: item.title,
          relationshipType: 'OWNS',
          weight: 0.95,
        },
      });
    }

    // 4. If item is pending review, notify manager
    if (initialStatus === 'PENDING_REVIEW') {
      const targetManager = user.managerId
        ? await prisma.employee.findUnique({ where: { id: user.managerId } })
        : await prisma.employee.findFirst({ where: { role: 'Engineering Manager' } });

      if (targetManager) {
        await prisma.notification.create({
          data: {
            type: 'REVIEW_REQUESTED',
            title: 'Knowledge Review Required',
            message: `${user.name} submitted "${item.title}" for technical review.`,
            link: '/reviews',
            employeeId: targetManager.id,
          },
        });
      }
    }

    // 5. Log Activity and Audit Log
    await prisma.activity.create({
      data: {
        type: 'EXTRACTION',
        title: initialStatus === 'PENDING_REVIEW' ? `Knowledge Submitted for Review: ${item.title}` : `New Knowledge Added: ${item.title}`,
        description: `Knowledge capture (${item.type}) by ${user.name} (${user.role}). Status: ${initialStatus}.`,
        employeeId: authorEmployeeId,
        projectId: projectId || null,
      },
    });

    await logAudit(user, 'SUBMIT_KNOWLEDGE', 'KNOWLEDGE_ITEM', item.id, {
      title: item.title,
      status: initialStatus,
      visibility: item.visibility,
    });

    return NextResponse.json({
      success: true,
      item,
      pendingApproval: initialStatus === 'PENDING_REVIEW',
      message:
        initialStatus === 'PENDING_REVIEW'
          ? 'Knowledge item submitted for manager approval and added to the review queue.'
          : 'Knowledge item successfully published.',
    });
  } catch (error) {
    console.error('Failed to create knowledge item:', error);
    return NextResponse.json({ error: 'Failed to create knowledge item' }, { status: 500 });
  }
}
