import { NextRequest, NextResponse } from 'next/server';
import { executeRAGQuery } from '@/lib/ai/rag';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, logAudit } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'A query string is required' }, { status: 400 });
    }

    const user = await getCurrentUser();

    // Execute real RAG pipeline with user context
    const result = await executeRAGQuery(query.trim(), user);

    if (result.answer.startsWith('Access Restricted:')) {
      await logAudit(user, 'RESTRICTED_QUERY_ATTEMPTED', 'KNOWLEDGE_VAULT_AI', undefined, {
        query: query.trim(),
        role: user?.role,
      });
    } else {
      await logAudit(user, 'AI_ASSISTANT_QUERY', 'KNOWLEDGE_VAULT_AI', undefined, {
        query: query.trim(),
        citationCount: result.citations.length,
        isSufficientEvidence: result.isSufficientEvidence,
      });
    }

    // If a knowledge gap was detected, automatically log it as an open gap in the database
    if (result.knowledgeGapDetected && result.gapDetails) {
      const existingGap = await prisma.knowledgeGap.findFirst({
        where: { title: result.gapDetails.title },
      });
      if (!existingGap) {
        await prisma.knowledgeGap.create({
          data: {
            title: result.gapDetails.title,
            description: result.gapDetails.description,
            category: result.gapDetails.category,
            impact: 'HIGH',
            status: 'OPEN',
            suggestedAction: 'Collect undocumented procedural steps from team on-call or technical lead.',
          },
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('RAG AI Chat query failed:', error);
    return NextResponse.json(
      {
        answer: 'An unexpected error occurred while consulting organizational memory.',
        why: 'The internal vector retrieval or language model service encountered a timeout.',
        relevantContext: 'Please retry or verify database connectivity.',
        confidence: 0,
        isSufficientEvidence: false,
        citations: [],
        relatedKnowledge: [],
      },
      { status: 500 }
    );
  }
}
