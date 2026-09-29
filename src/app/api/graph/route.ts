import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type');
    const search = searchParams.get('search');

    // Fetch all stored relationships
    const relationships = await prisma.knowledgeRelationship.findMany({
      orderBy: { weight: 'desc' },
      take: 100,
    });

    // Also fetch core entities to build rich nodes
    const [employees, projects, technologies, knowledgeItems, sources] = await Promise.all([
      prisma.employee.findMany(),
      prisma.project.findMany(),
      prisma.technology.findMany(),
      prisma.knowledgeItem.findMany({
        where: { status: 'APPROVED' },
        take: 30,
      }),
      prisma.knowledgeSource.findMany({ take: 15 }),
    ]);

    const nodeMap = new Map<string, any>();

    // Add Employees as nodes
    employees.forEach((emp) => {
      nodeMap.set(emp.id, {
        id: emp.id,
        label: emp.name,
        type: 'EMPLOYEE',
        subtitle: emp.role,
        department: emp.department,
        risk: emp.riskLevel,
        coverage: emp.knowledgeCoverage,
        concentrationRatio: emp.concentrationRatio,
        bio: emp.bio,
      });
    });

    // Add Projects as nodes
    projects.forEach((prj) => {
      nodeMap.set(prj.id, {
        id: prj.id,
        label: prj.name,
        type: 'PROJECT',
        subtitle: prj.department,
        risk: prj.riskLevel,
        coverage: prj.coverageScore,
        description: prj.description,
      });
    });

    // Add Technologies as nodes
    technologies.forEach((tech) => {
      nodeMap.set(tech.id, {
        id: tech.id,
        label: tech.name,
        type: 'TECHNOLOGY',
        subtitle: `${tech.category} ${tech.version || ''}`.trim(),
      });
    });

    // Add Knowledge items as nodes
    knowledgeItems.forEach((ki) => {
      nodeMap.set(ki.id, {
        id: ki.id,
        label: ki.title,
        type: 'KNOWLEDGE',
        subtitle: ki.type,
        risk: ki.risk,
        confidence: ki.confidence,
        summary: ki.summary,
        whyItMatters: ki.whyItMatters,
      });
    });

    // Add Sources as Documentation nodes
    sources.forEach((src) => {
      nodeMap.set(src.id, {
        id: src.id,
        label: src.title,
        type: 'DOCUMENTATION',
        subtitle: src.type,
        confidence: src.confidence,
      });
    });

    // Add any missing source/target from relationships as generic entity nodes
    relationships.forEach((rel) => {
      if (!nodeMap.has(rel.sourceEntityId)) {
        nodeMap.set(rel.sourceEntityId, {
          id: rel.sourceEntityId,
          label: rel.sourceLabel,
          type: rel.sourceEntityType,
        });
      }
      if (!nodeMap.has(rel.targetEntityId)) {
        nodeMap.set(rel.targetEntityId, {
          id: rel.targetEntityId,
          label: rel.targetLabel,
          type: rel.targetEntityType,
        });
      }
    });

    // Filter nodes if type or search filter specified
    let allNodes = Array.from(nodeMap.values());
    if (filterType && filterType !== 'ALL') {
      allNodes = allNodes.filter((n) => n.type === filterType);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      allNodes = allNodes.filter(
        (n) => n.label.toLowerCase().includes(q) || (n.subtitle && n.subtitle.toLowerCase().includes(q))
      );
    }

    const validNodeIds = new Set(allNodes.map((n) => n.id));

    // Filter edges connected to available nodes
    const edges = relationships
      .filter((r) => validNodeIds.has(r.sourceEntityId) && validNodeIds.has(r.targetEntityId))
      .map((r) => ({
        id: r.id,
        source: r.sourceEntityId,
        target: r.targetEntityId,
        label: r.relationshipType,
        type: r.relationshipType,
        weight: r.weight,
        description: r.description,
      }));

    return NextResponse.json({
      nodes: allNodes,
      edges,
      stats: {
        totalNodes: allNodes.length,
        totalEdges: edges.length,
      },
    });
  } catch (error) {
    console.error('Failed to load knowledge graph:', error);
    return NextResponse.json({ error: 'Failed to retrieve graph' }, { status: 500 });
  }
}
