import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/ai/llm-provider';

export async function POST(req: NextRequest) {
  try {
    const { messages, userStatement } = await req.json();

    const systemPrompt = `You are KnowledgeVault's Tacit Knowledge Ingestion Agent.
Your goal is to conduct a brief, highly focused 2-3 turn interview with an engineer who wants to record an unwritten operational rule, constraint, or workaround ("something only they know").
Ask intelligent follow-up questions to understand:
1. Operational trigger / condition (when does this apply?)
2. System / Service affected
3. Failure mode or consequence if violated

If you have gathered sufficient context (after 2-3 messages), end your response with:
"[READY_TO_RECORD]"
followed by a valid JSON block on the next line:
\`\`\`json
{
  "title": "Clear concise procedural title",
  "summary": "One sentence summary of the rule",
  "content": "Detailed steps or constraint",
  "type": "BUSINESS_RULE" | "OPERATIONAL_TIP" | "TROUBLESHOOTING" | "EDGE_CASE",
  "risk": "HIGH" | "CRITICAL" | "MEDIUM",
  "project": "Payment System" | "Customer Portal" | "Analytics Platform",
  "whyItMatters": "Why this unwritten rule protects operations"
}
\`\`\``;

    const chatMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
    ];

    if (userStatement) {
      chatMessages.push({ role: 'user', content: userStatement });
    }

    const aiResponse = await callLLM(chatMessages, { temperature: 0.2 });

    let isReady = false;
    let extractedRecord: any = null;

    if (aiResponse.includes('[READY_TO_RECORD]')) {
      isReady = true;
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          extractedRecord = JSON.parse(jsonMatch[1]);
        } catch {}
      }
    }

    return NextResponse.json({
      response: aiResponse.replace(/\[READY_TO_RECORD\][\s\S]*/, '').trim(),
      isReady,
      extractedRecord,
    });
  } catch (error) {
    console.error('Conversational capture failed:', error);
    return NextResponse.json({
      response: 'Understood. Which project or service does this rule apply to?',
      isReady: false,
    });
  }
}
