import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
  const maskedKey = hasApiKey
    ? `${process.env.OPENAI_API_KEY?.slice(0, 7)}...${process.env.OPENAI_API_KEY?.slice(-4)}`
    : 'Not configured (using local intelligent engine)';

  return NextResponse.json({
    workspace: {
      name: 'NovaTech Enterprise Intelligence',
      slug: 'novatech-ai',
      plan: 'Enterprise Continuity Tier',
      retentionPolicy: 'Indefinite Verified Memory',
    },
    ai: {
      provider: hasApiKey ? 'OpenAI / Custom API' : 'KnowledgeVault Local Hybrid Engine',
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      temperature: 0.15,
      isConfigured: hasApiKey,
      maskedApiKey: maskedKey,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
    riskThresholds: {
      criticalConcentrationPercent: 70,
      staleDaysThreshold: 60,
      minimumCoverageGoal: 75,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // In production this would write to a secure secrets vault or database
    return NextResponse.json({
      success: true,
      message: 'Workspace configurations saved successfully',
      updated: body,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
