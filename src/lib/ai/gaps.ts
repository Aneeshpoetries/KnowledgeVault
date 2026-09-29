import { prisma } from '../prisma';
import { callLLM } from './llm-provider';

export async function detectKnowledgeGapsForProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      knowledgeItems: true,
      employees: { include: { employee: true } },
    },
  });

  if (!project) return [];

  // Group items by category / type
  const typeCounts: Record<string, number> = {};
  for (const item of project.knowledgeItems) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }

  // Detect gaps where essential operational areas have < 2 items
  const potentialGaps: { category: string; reason: string; impact: string }[] = [];

  if ((typeCounts['TROUBLESHOOTING'] || 0) < 2) {
    potentialGaps.push({
      category: 'Troubleshooting',
      reason: 'Low density of documented production failure recovery patterns and incident playbooks.',
      impact: 'CRITICAL',
    });
  }

  if ((typeCounts['EDGE_CASE'] || 0) < 2) {
    potentialGaps.push({
      category: 'Edge Cases',
      reason: 'Legacy API compatibility and unhandled exception conditions are undocumented.',
      impact: 'HIGH',
    });
  }

  if ((typeCounts['DEPENDENCY'] || 0) < 2) {
    potentialGaps.push({
      category: 'Dependencies',
      reason: 'External vendor tier-3 escalation paths and undocumented queue connections missing.',
      impact: 'HIGH',
    });
  }

  if ((typeCounts['BUSINESS_RULE'] || 0) < 2) {
    potentialGaps.push({
      category: 'Business Rules',
      reason: 'Critical transactional cutoff windows and fee calculation constraints not formally codified.',
      impact: 'HIGH',
    });
  }

  return potentialGaps;
}

export async function generateTargetedQuestionsForGap(gapTitle: string, category: string, context?: string) {
  const systemPrompt = `You are KnowledgeVault AI, an expert knowledge continuity specialist.
Your goal is to generate HIGHLY TARGETED, concrete questions to extract tacit knowledge from senior engineers before they leave.
NEVER ask generic HR questions like "What are your responsibilities?" or "Tell me about your job."
Ask deep, operational questions about:
- What specific error codes or silent failures occur
- What undocumented scripts or manual DB queries they run during incidents
- What secret configs or environment quirks they know
- What mistakes a newcomer will make on day one

Format as JSON:
{
  "questions": [
    {
      "question": string,
      "category": string,
      "rationale": string,
      "priority": "CRITICAL" | "HIGH" | "MEDIUM"
    }
  ]
}`;

  const userPrompt = `GAP TITLE: "${gapTitle}"
CATEGORY: "${category}"
CONTEXT / SYSTEM: "${context || 'Mission critical payment and infrastructure system'}"

Generate 3 deeply insightful, targeted technical questions.`;

  try {
    const raw = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.2,
        responseFormat: { type: 'json_object' },
      }
    );

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
  } catch (err) {
    console.warn('Failed to parse gap questions JSON:', err);
  }

  // Fallback targeted questions
  return [
    {
      question: `What specific failure modes in ${gapTitle} have you encountered that aren't documented in our public runbooks?`,
      category,
      rationale: 'Addresses missing troubleshooting knowledge without relying on generic documentation.',
      priority: 'CRITICAL',
    },
    {
      question: `If our primary gateway or backend service crashes during a high-traffic window, what exact manual commands or secret flags do you execute to recover?`,
      category,
      rationale: 'Captures the critical failover sequence before key person departure.',
      priority: 'HIGH',
    },
    {
      question: `What are the undocumented dependencies or vendor contacts that a replacement engineer must know about immediately?`,
      category: 'Dependencies',
      rationale: 'Identifies external bottlenecks and vendor liaisons.',
      priority: 'HIGH',
    },
  ];
}
