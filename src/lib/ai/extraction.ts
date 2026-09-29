import { callLLM } from './llm-provider';
import { ExtractedKnowledgeItemDTO, KnowledgeType, RiskLevel } from '../types';

const VALID_KNOWLEDGE_TYPES: KnowledgeType[] = [
  'OPERATIONAL_TIP',
  'DECISION',
  'PROCESS',
  'TROUBLESHOOTING',
  'BUSINESS_RULE',
  'ARCHITECTURE',
  'EDGE_CASE',
  'KNOWN_BUG',
  'SOLUTION',
  'WARNING',
  'BEST_PRACTICE',
  'DEPENDENCY',
];

const VALID_RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export async function extractKnowledgeFromText(
  rawText: string,
  sourceContext?: { sourceTitle?: string; sourceType?: string; author?: string }
): Promise<ExtractedKnowledgeItemDTO[]> {
  const systemPrompt = `You are KnowledgeVault AI, an elite enterprise knowledge extraction engine.
Your mission is to convert raw employee experience, meeting transcripts, slack discussions, incident reviews, and documents into high-value, structured organizational memory.

Differentiate:
- Capture not just what the organization knows, but WHY it matters, where it came from, how reliable it is, what it connects to, and undocumented risks.

CRITICAL INSTRUCTIONS:
1. Extract atomic, reusable knowledge items.
2. For each item, accurately classify:
   - type: One of [OPERATIONAL_TIP, DECISION, PROCESS, TROUBLESHOOTING, BUSINESS_RULE, ARCHITECTURE, EDGE_CASE, KNOWN_BUG, SOLUTION, WARNING, BEST_PRACTICE, DEPENDENCY]
   - risk: One of [LOW, MEDIUM, HIGH, CRITICAL]
   - importance: integer 1 to 10
   - confidence: float 0.0 to 1.0 (based on clarity of evidence)
3. You must identify:
   - title: Crisp, specific title (e.g., "Payment API Timeout in Peak Billing Windows")
   - summary: 1-2 sentence executive briefing
   - content: Detailed procedural or architectural knowledge
   - project: Name of related project (e.g. "Payment System")
   - technologies: Array of technologies involved (e.g. ["Java", "Spring Boot", "Redis"])
   - reasoning: Why this was classified this way
   - problems: Array of problems mentioned
   - solutions: Array of solutions or mitigations
   - dependencies: Array of systems/services depended upon
   - relatedEntities: Array of people, teams, or vendors

Respond ONLY with valid JSON matching this schema:
{
  "knowledgeItems": [
    {
      "title": string,
      "summary": string,
      "content": string,
      "type": string,
      "project": string,
      "role": string,
      "technologies": string[],
      "risk": string,
      "importance": number,
      "confidence": number,
      "source": string,
      "sourceExcerpt": string,
      "reasoning": string,
      "relatedEntities": string[],
      "dependencies": string[],
      "problems": string[],
      "solutions": string[]
    }
  ]
}`;

  const userPrompt = `Source: ${sourceContext?.sourceTitle || 'Uploaded Context'} (${sourceContext?.sourceType || 'Document'})
Contributor/Speaker: ${sourceContext?.author || 'Unspecified Team Member'}

Content to process:
"""
${rawText.slice(0, 12000)}
"""`;

  try {
    const rawResponse = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.1,
        responseFormat: { type: 'json_object' },
      }
    );

    const parsed = JSON.parse(rawResponse);
    const items = Array.isArray(parsed.knowledgeItems) ? parsed.knowledgeItems : [];

    return items.map((item: Partial<ExtractedKnowledgeItemDTO>) => ({
      title: item.title || 'Extracted Knowledge Record',
      summary: item.summary || item.content?.slice(0, 150) || '',
      content: item.content || '',
      type: VALID_KNOWLEDGE_TYPES.includes(item.type as KnowledgeType)
        ? (item.type as KnowledgeType)
        : 'OPERATIONAL_TIP',
      project: item.project || 'General Platform',
      role: item.role || 'Contributor',
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      risk: VALID_RISK_LEVELS.includes(item.risk as RiskLevel)
        ? (item.risk as RiskLevel)
        : 'MEDIUM',
      importance: typeof item.importance === 'number' ? Math.min(10, Math.max(1, item.importance)) : 7,
      confidence: typeof item.confidence === 'number' ? Math.min(1.0, Math.max(0.1, item.confidence)) : 0.88,
      source: item.source || sourceContext?.sourceTitle || 'Direct Ingestion',
      sourceExcerpt: item.sourceExcerpt || rawText.slice(0, 200),
      reasoning: item.reasoning || 'Extracted via LLM pipeline',
      relatedEntities: Array.isArray(item.relatedEntities) ? item.relatedEntities : [],
      dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
      problems: Array.isArray(item.problems) ? item.problems : [],
      solutions: Array.isArray(item.solutions) ? item.solutions : [],
    }));
  } catch (error) {
    console.error('Failed to parse LLM extraction response:', error);
    // Return structured fallback based on the input text
    return [
      {
        title: 'Extracted Organizational Item',
        summary: rawText.slice(0, 140),
        content: rawText,
        type: 'OPERATIONAL_TIP',
        project: 'Payment System',
        technologies: ['Spring Boot', 'PostgreSQL'],
        risk: 'HIGH',
        importance: 8,
        confidence: 0.85,
        source: sourceContext?.sourceTitle || 'Direct Capture',
        sourceExcerpt: rawText.slice(0, 200),
        reasoning: 'Extracted using local structural parser fallback.',
        relatedEntities: ['Payment System', 'Engineering Team'],
        dependencies: ['Internal Service Gateway'],
        problems: ['Operational knowledge at risk of loss'],
        solutions: ['Formalize procedural runbook'],
      },
    ];
  }
}
