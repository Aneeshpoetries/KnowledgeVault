import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buildAccessibleKnowledgeWhere } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const accessibleKnowledgeWhere = user
      ? buildAccessibleKnowledgeWhere(user)
      : { status: 'APPROVED', visibility: 'PUBLIC' };

    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type');
    const search = searchParams.get('search');

    // Scope employees query by user role
    let employeeWhere: any = {};
    if (user && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        employeeWhere = {
          OR: [
            { id: user.employeeId || '' },
            { managerId: user.employeeId || '' },
            { id: { in: user.directReportIds } },
          ],
        };
      } else {
        // EMPLOYEE or NEW_EMPLOYEE
        employeeWhere = {
          OR: [
            { id: user.employeeId || '' },
            { id: user.managerId || '' },
          ],
        };
      }
    }

    // Scope projects query by user role
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

    // Fetch scoped entities to build rich nodes
    const [
      employees, projects, technologies, knowledgeItems, sources,
      employeeProjects, projectTechnologies, employeeTechnologies
    ] = await Promise.all([
      prisma.employee.findMany({ where: employeeWhere }),
      prisma.project.findMany({ where: projectWhere }),
      prisma.technology.findMany(),
      prisma.knowledgeItem.findMany({
        where: accessibleKnowledgeWhere,
        take: 40,
      }),
      prisma.knowledgeSource.findMany({ take: 15 }),
      prisma.employeeProject.findMany(),
      prisma.projectTechnology.findMany(),
      prisma.employeeTechnology.findMany(),
    ]);

    const scopedEmployeeIds = new Set(employees.map((e) => e.id));
    const scopedProjectIds = new Set(projects.map((p) => p.id));
    const scopedKnowledgeIds = new Set(knowledgeItems.map((k) => k.id));

    // Also fetch any explicit relationships if they exist
    const explicitRelationships = await prisma.knowledgeRelationship.findMany({
      where: user?.role === 'ADMIN' ? {} : {
        OR: [
          { sourceEntityId: { in: [...scopedEmployeeIds, ...scopedProjectIds, ...scopedKnowledgeIds] } },
          { targetEntityId: { in: [...scopedEmployeeIds, ...scopedProjectIds, ...scopedKnowledgeIds] } },
        ],
      },
      orderBy: { weight: 'desc' },
      take: 100,
    });

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

    // Add any missing source/target from explicit relationships as generic entity nodes
    explicitRelationships.forEach((rel) => {
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

    // Synthesize edges from relational data
    const synthesizedEdges: any[] = [];
    
    // Employee -> Project
    employeeProjects.forEach(ep => {
      synthesizedEdges.push({
        id: `ep-${ep.id}`,
        source: ep.employeeId,
        target: ep.projectId,
        label: ep.role || 'WORKS_ON',
        type: 'WORKS_ON',
        weight: 1,
      });
    });

    // Project -> Technology
    projectTechnologies.forEach(pt => {
      synthesizedEdges.push({
        id: `pt-${pt.id}`,
        source: pt.projectId,
        target: pt.technologyId,
        label: 'USES',
        type: 'USES',
        weight: 1,
      });
    });

    // Employee -> Technology
    employeeTechnologies.forEach(et => {
      synthesizedEdges.push({
        id: `et-${et.id}`,
        source: et.employeeId,
        target: et.technologyId,
        label: et.proficiency,
        type: 'KNOWS',
        weight: 1,
      });
    });

    // Knowledge Item Connections
    knowledgeItems.forEach(ki => {
      if (ki.projectId) {
        synthesizedEdges.push({
          id: `k-p-${ki.id}`,
          source: ki.projectId,
          target: ki.id,
          label: 'DOCUMENTS',
          type: 'DOCUMENTS',
          weight: 1,
        });
      }
      if (ki.employeeId) {
        synthesizedEdges.push({
          id: `k-e-${ki.id}`,
          source: ki.employeeId,
          target: ki.id,
          label: 'OWNS',
          type: 'OWNS',
          weight: 1,
        });
      }
      if (ki.createdByEmployeeId && ki.createdByEmployeeId !== ki.employeeId) {
        synthesizedEdges.push({
          id: `k-c-${ki.id}`,
          source: ki.createdByEmployeeId,
          target: ki.id,
          label: 'CREATED',
          type: 'CREATED',
          weight: 1,
        });
      }
      if (ki.sourceId) {
        synthesizedEdges.push({
          id: `k-s-${ki.id}`,
          source: ki.sourceId,
          target: ki.id,
          label: 'EXTRACTED_FROM',
          type: 'EXTRACTED_FROM',
          weight: 1,
        });
      }
    });

    const explicitEdges = explicitRelationships.map((r) => ({
      id: r.id,
      source: r.sourceEntityId,
      target: r.targetEntityId,
      label: r.relationshipType,
      type: r.relationshipType,
      weight: r.weight,
      description: r.description,
    }));

    const allEdges = [...synthesizedEdges, ...explicitEdges];

    // Filter edges connected to available nodes
    const edges = allEdges
      .filter((r) => validNodeIds.has(r.source) && validNodeIds.has(r.target));

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
