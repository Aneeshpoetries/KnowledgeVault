import { NextRequest, NextResponse } from 'next/server';
import { extractKnowledgeFromText } from '@/lib/ai/extraction';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sourceId, sourceTitle, sourceType, author } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required for AI processing' }, { status: 400 });
    }

    // Call real LLM extraction pipeline
    const extractedItems = await extractKnowledgeFromText(text, {
      sourceTitle,
      sourceType,
      author,
    });

    if (sourceId) {
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          status: 'PROCESSING',
          extractedCount: extractedItems.length,
          highRiskCount: extractedItems.filter((i) => i.risk === 'CRITICAL' || i.risk === 'HIGH').length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      items: extractedItems,
      count: extractedItems.length,
    });
  } catch (error) {
    console.error('AI Knowledge extraction failed:', error);
    return NextResponse.json({ error: 'AI processing is temporarily unavailable' }, { status: 500 });
  }
}
