import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from '@/lib/ai/embeddings';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const trimmedQuery = query.trim();
    const queryEmbedding = await generateEmbedding(trimmedQuery);
    const queryWords = trimmedQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    // 1. Vector Search over Knowledge Embeddings
    const embeddings = await prisma.knowledgeEmbedding.findMany({
      include: {
        knowledgeItem: {
          include: {
            project: true,
            employee: true,
            source: true,
          },
        },
      },
    });

    const matchedKnowledge: any[] = [];
    for (const record of embeddings) {
      if (!record.knowledgeItem) continue;
      try {
        const vec: number[] = JSON.parse(record.vectorJson);
        const similarity = cosineSimilarity(queryEmbedding, vec);

        // Keyword boost
        const itemText = `${record.knowledgeItem.title} ${record.knowledgeItem.summary} ${record.knowledgeItem.content}`.toLowerCase();
        let keywordHits = 0;
        for (const w of queryWords) {
          if (itemText.includes(w)) keywordHits++;
        }
        const keywordScore = keywordHits / Math.max(1, queryWords.length);
        const combinedScore = similarity * 0.65 + keywordScore * 0.35;

        if (combinedScore > 0.15) {
          matchedKnowledge.push({
            type: 'KNOWLEDGE',
            score: Number(combinedScore.toFixed(3)),
            item: record.knowledgeItem,
            matchedSnippet: record.knowledgeItem.summary || record.knowledgeItem.content.slice(0, 160),
          });
        }
      } catch {
        // Ignore unparseable
      }
    }

    matchedKnowledge.sort((a, b) => b.score - a.score);

    // 2. Search Employees (e.g. "Who knows about payment failures?")
    const employees = await prisma.employee.findMany({
      include: {
        projects: { include: { project: true } },
        technologies: { include: { technology: true } },
      },
    });

    const matchedEmployees: any[] = [];
    for (const emp of employees) {
      const empText = `${emp.name} ${emp.role} ${emp.department} ${emp.bio} ${emp.projects.map((p) => p.project.name).join(' ')} ${emp.technologies.map((t) => t.technology.name).join(' ')}`.toLowerCase();
      let hits = 0;
      for (const w of queryWords) {
        if (empText.includes(w)) hits++;
      }
      if (hits > 0) {
        matchedEmployees.push({
          type: 'EMPLOYEE',
          score: hits / Math.max(1, queryWords.length),
          item: emp,
          matchedSnippet: `${emp.role} in ${emp.department} with expertise in ${emp.technologies.map((t) => t.technology.name).slice(0, 3).join(', ')}`,
        });
      }
    }

    // 3. Search Projects
    const projects = await prisma.project.findMany();
    const matchedProjects: any[] = [];
    for (const p of projects) {
      const pText = `${p.name} ${p.description} ${p.department}`.toLowerCase();
      let hits = 0;
      for (const w of queryWords) {
        if (pText.includes(w)) hits++;
      }
      if (hits > 0) {
        matchedProjects.push({
          type: 'PROJECT',
          score: hits / Math.max(1, queryWords.length),
          item: p,
          matchedSnippet: p.description,
        });
      }
    }

    // 4. Graph Connections for matched items
    const topKnowledgeIds = matchedKnowledge.slice(0, 5).map((k) => k.item.id);
    const relatedGraphEdges = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [
          { sourceEntityId: { in: topKnowledgeIds } },
          { targetEntityId: { in: topKnowledgeIds } },
        ],
      },
    });

    return NextResponse.json({
      query: trimmedQuery,
      knowledge: matchedKnowledge.slice(0, 8),
      employees: matchedEmployees.slice(0, 4),
      projects: matchedProjects.slice(0, 3),
      graphRelationships: relatedGraphEdges,
    });
  } catch (error) {
    console.error('Semantic search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
