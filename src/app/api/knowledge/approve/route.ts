import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { calculateCoverageForEmployee } from '@/lib/coverage-engine';
import { ExtractedKnowledgeItemDTO } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, sourceId, projectId, employeeId } = body as {
      items: ExtractedKnowledgeItemDTO[];
      sourceId?: string;
      projectId?: string;
      employeeId?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No approved items to save' }, { status: 400 });
    }

    // Resolve project and employee if passed or infer from names
    let resolvedProjectId = projectId;
    let resolvedEmployeeId = employeeId;

    if (!resolvedProjectId && items[0]?.project) {
      const p = await prisma.project.findFirst({
        where: { name: { contains: items[0].project } },
      });
      if (p) resolvedProjectId = p.id;
    }

    if (!resolvedEmployeeId && items[0]?.relatedEntities?.length) {
      const e = await prisma.employee.findFirst({
        where: { name: { in: items[0].relatedEntities } },
      });
      if (e) resolvedEmployeeId = e.id;
    }

    const savedRecords = [];

    for (const item of items) {
      // 1. Create KnowledgeItem
      const saved = await prisma.knowledgeItem.create({
        data: {
          title: item.title,
          summary: item.summary || item.content.slice(0, 150),
          content: item.content,
          originalSourceText: item.sourceExcerpt || item.content,
          aiInterpretation: item.reasoning || 'Extracted and verified via KnowledgeVault AI ingestion pipeline.',
          whyItMatters: item.reasoning || 'Critical institutional knowledge captured for continuity.',
          type: item.type,
          risk: item.risk || 'MEDIUM',
          importance: item.importance || 8,
          confidence: item.confidence || 0.91,
          status: 'APPROVED',
          freshness: 'FRESH',
          lastVerifiedAt: new Date(),
          verifiedBy: 'AI Ingestion Pipeline',
          projectId: resolvedProjectId || null,
          employeeId: resolvedEmployeeId || null,
          sourceId: sourceId || null,
          tagsJson: JSON.stringify(item.technologies || []),
          problemsJson: JSON.stringify(item.problems || []),
          solutionsJson: JSON.stringify(item.solutions || []),
          dependenciesJson: JSON.stringify(item.dependencies || []),
          relatedEntitiesJson: JSON.stringify(item.relatedEntities || []),
        },
      });

      // 2. Generate and save embedding
      const textToEmbed = `${saved.title} ${saved.summary} ${saved.content} ${saved.type}`;
      const vec = await generateEmbedding(textToEmbed);
      await prisma.knowledgeEmbedding.create({
        data: {
          knowledgeItemId: saved.id,
          vectorJson: JSON.stringify(vec),
          model: 'text-embedding-3-small',
          dimensions: vec.length,
        },
      });

      // 3. Connect to Knowledge Graph
      if (resolvedProjectId) {
        const prj = await prisma.project.findUnique({ where: { id: resolvedProjectId } });
        if (prj) {
          await prisma.knowledgeRelationship.create({
            data: {
              sourceEntityId: prj.id,
              sourceEntityType: 'PROJECT',
              sourceLabel: prj.name,
              targetEntityId: saved.id,
              targetEntityType: 'KNOWLEDGE',
              targetLabel: saved.title,
              relationshipType: 'DOCUMENTS',
              weight: 0.95,
            },
          });
        }
      }

      if (resolvedEmployeeId) {
        const emp = await prisma.employee.findUnique({ where: { id: resolvedEmployeeId } });
        if (emp) {
          await prisma.knowledgeRelationship.create({
            data: {
              sourceEntityId: emp.id,
              sourceEntityType: 'EMPLOYEE',
              sourceLabel: emp.name,
              targetEntityId: saved.id,
              targetEntityType: 'KNOWLEDGE',
              targetLabel: saved.title,
              relationshipType: 'OWNS',
              weight: 0.9,
            },
          });
        }
      }

      // Connect technologies if mentioned
      for (const techName of item.technologies || []) {
        const tech = await prisma.technology.findFirst({
          where: { name: { contains: techName } },
        });
        if (tech) {
          await prisma.knowledgeRelationship.create({
            data: {
              sourceEntityId: saved.id,
              sourceEntityType: 'KNOWLEDGE',
              sourceLabel: saved.title,
              targetEntityId: tech.id,
              targetEntityType: 'TECHNOLOGY',
              targetLabel: tech.name,
              relationshipType: 'USES',
              weight: 0.85,
            },
          });
        }
      }

      savedRecords.push(saved);
    }

    // 4. Update KnowledgeSource status
    if (sourceId) {
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          status: 'PROCESSED',
          extractedCount: savedRecords.length,
          processedAt: new Date(),
        },
      });
    }

    // 5. Update Coverage Score dynamically
    if (resolvedProjectId) {
      await calculateCoverageForEmployee(undefined, resolvedProjectId);
    }
    if (resolvedEmployeeId) {
      await calculateCoverageForEmployee(resolvedEmployeeId, undefined);
    }

    // 6. Log Activity
    await prisma.activity.create({
      data: {
        type: 'SOURCE_PROCESSED',
        title: `Ingested ${savedRecords.length} Verified Knowledge Items`,
        description: `Source processed into graph with active vector embeddings.`,
        projectId: resolvedProjectId || null,
        employeeId: resolvedEmployeeId || null,
      },
    });

    return NextResponse.json({
      success: true,
      count: savedRecords.length,
      items: savedRecords,
    });
  } catch (error) {
    console.error('Failed to approve and save knowledge items:', error);
    return NextResponse.json({ error: 'Failed to commit knowledge items to memory' }, { status: 500 });
  }
}
