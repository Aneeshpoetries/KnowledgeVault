import { NextRequest, NextResponse } from 'next/server';
import { executeRAGQuery } from '@/lib/ai/rag';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'A query string is required' }, { status: 400 });
    }

    // Execute real RAG pipeline
    const result = await executeRAGQuery(query.trim());

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
