import { prisma } from '../prisma';
import { generateEmbedding, cosineSimilarity } from './embeddings';
import { callLLM } from './llm-provider';
import { ChatAnswerResponse, ChatMessageCitation, KnowledgeType, RiskLevel } from '../types';

export async function executeRAGQuery(userQuery: string): Promise<ChatAnswerResponse> {
  // 1. Generate embedding for user query
  const queryEmbedding = await generateEmbedding(userQuery);

  // 2. Fetch stored embeddings and knowledge items
  const storedEmbeddings = await prisma.knowledgeEmbedding.findMany({
    include: {
      knowledgeItem: {
        include: {
          project: true,
          source: true,
          employee: true,
        },
      },
    },
  });

  // 3. Compute cosine similarity scores
  const scoredItems: { item: any; score: number }[] = [];

  for (const record of storedEmbeddings) {
    if (!record.knowledgeItem) continue;
    try {
      const vec: number[] = JSON.parse(record.vectorJson);
      const similarity = cosineSimilarity(queryEmbedding, vec);
      scoredItems.push({
        item: record.knowledgeItem,
        score: similarity,
      });
    } catch {
      // Ignore unparseable
    }
  }

  // Also include keyword search matching for robust hybrid retrieval
  const queryWords = userQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const allKnowledgeItems = await prisma.knowledgeItem.findMany({
    where: { status: 'APPROVED' },
    include: {
      project: true,
      source: true,
      employee: true,
    },
  });

  for (const item of allKnowledgeItems) {
    const textBlob = `${item.title} ${item.summary} ${item.content} ${item.whyItMatters}`.toLowerCase();
    let keywordHits = 0;
    for (const word of queryWords) {
      if (textBlob.includes(word)) keywordHits++;
    }
    const keywordScore = keywordHits / Math.max(1, queryWords.length);

    const existing = scoredItems.find((s) => s.item.id === item.id);
    if (existing) {
      existing.score = Math.max(existing.score, keywordScore, (existing.score * 0.6 + keywordScore * 0.4));
    } else if (keywordScore >= 0.15) {
      scoredItems.push({ item, score: keywordScore * 0.75 });
    }
  }

  // Sort by score descending and take top 5
  scoredItems.sort((a, b) => b.score - a.score);
  const topMatches = scoredItems.slice(0, 5);

  // Check if we have sufficient evidence (top match score >= 0.15)
  const isSufficientEvidence = topMatches.length > 0 && topMatches[0].score >= 0.15;

  if (!isSufficientEvidence) {
    return {
      answer: "I couldn't find enough verified organizational knowledge to answer this confidently.",
      why: "Our organizational memory currently lacks verified records or runbooks matching this specific query.",
      relevantContext: "The system scanned all indexed documents, meeting transcripts, and employee knowledge graphs but found insufficient semantic overlap.",
      confidence: 0.15,
      isSufficientEvidence: false,
      knowledgeGapDetected: true,
      gapDetails: {
        title: `Unresolved Inquiry: ${userQuery}`,
        description: 'User queried operational procedures that have no verified documentation in the system.',
        category: 'Troubleshooting',
      },
      citations: [],
      relatedKnowledge: [],
    };
  }

  // 4. Retrieve Graph Relationships for top matched items
  const matchedItemIds = topMatches.map((m) => m.item.id);
  const relatedRelationships = await prisma.knowledgeRelationship.findMany({
    where: {
      OR: [
        { sourceEntityId: { in: matchedItemIds } },
        { targetEntityId: { in: matchedItemIds } },
      ],
    },
  });

  // 5. Build Grounded Context for LLM
  let contextBlock = '';
  const citations: ChatMessageCitation[] = [];

  for (const match of topMatches) {
    const it = match.item;
    citations.push({
      id: it.id,
      title: it.title,
      type: it.type as KnowledgeType,
      sourceName: it.source?.title || 'Verified Organizational Memory',
      sourceType: it.source?.type || 'DOCUMENT',
      excerpt: it.originalSourceText || it.summary,
      confidence: it.confidence,
      risk: it.risk as RiskLevel,
      projectId: it.projectId,
      projectName: it.project?.name,
    });

    contextBlock += `
---
ITEM ID: ${it.id}
TITLE: ${it.title}
TYPE: ${it.type}
RISK: ${it.risk}
CONFIDENCE: ${Math.round(it.confidence * 100)}%
SOURCE: ${it.source?.title || 'Direct Record'}
SUMMARY: ${it.summary}
CONTENT: ${it.content}
ORIGINAL SOURCE EXCERPT: ${it.originalSourceText}
WHY IT MATTERS: ${it.whyItMatters}
RELATED PROBLEMS: ${it.problemsJson || '[]'}
SOLUTIONS: ${it.solutionsJson || '[]'}
`;
  }

  let graphContext = '';
  if (relatedRelationships.length > 0) {
    graphContext = '\nGRAPH CONNECTIONS:\n' +
      relatedRelationships
        .map((r) => `- [${r.sourceEntityType}] ${r.sourceLabel} --(${r.relationshipType})--> [${r.targetEntityType}] ${r.targetLabel}`)
        .join('\n');
  }

  // 6. Send to LLM with Strict RAG Guardrails
  const systemPrompt = `You are KnowledgeVault AI, the official Organizational Memory Assistant.
Your core directive:
- Answer using ONLY the provided retrieved organizational knowledge and evidence.
- NEVER invent or hallucinate company-specific facts, endpoints, credentials, or internal procedures.
- Clearly distinguish between documented facts, inferred relationships, and uncertainty.
- If evidence is partial or ambiguous, state the limitation transparently.
- Structure your response as JSON matching:
{
  "answer": "Clear, direct, actionable answer",
  "recommendedAction": "Exact steps to take or verify",
  "why": "Specific rationale grounded in past incidents or rules",
  "relevantContext": "Synthesized context from the cited records",
  "confidence": number between 0.0 and 1.0
}`;

  const prompt = `QUESTION: "${userQuery}"

RETRIEVED KNOWLEDGE CONTEXT:
${contextBlock}

${graphContext}`;

  let parsedResponse = {
    answer: '',
    recommendedAction: '',
    why: '',
    relevantContext: '',
    confidence: topMatches[0].item.confidence || 0.9,
  };

  try {
    const rawAnswer = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.1,
        responseFormat: { type: 'json_object' },
      }
    );

    const data = JSON.parse(rawAnswer);
    parsedResponse = {
      answer: data.answer || data.recommendedAction || 'Refer to the cited organizational documents.',
      recommendedAction: data.recommendedAction,
      why: data.why || 'Grounded in documented incident post-mortems and verified engineering practices.',
      relevantContext: data.relevantContext || topMatches[0].item.summary,
      confidence: typeof data.confidence === 'number' ? data.confidence : topMatches[0].item.confidence,
    };
  } catch (err) {
    console.warn('Failed to parse RAG LLM response JSON, using fallback synthesizer:', err);
    parsedResponse = {
      answer: `Follow the verified organizational procedure for "${topMatches[0].item.title}": ${topMatches[0].item.summary}`,
      recommendedAction: topMatches[0].item.solutionsJson ? JSON.parse(topMatches[0].item.solutionsJson).join(', ') : 'Verify gateway timeouts and queue thresholds.',
      why: topMatches[0].item.whyItMatters,
      relevantContext: topMatches[0].item.content,
      confidence: topMatches[0].item.confidence,
    };
  }

  const relatedKnowledge = topMatches.map((m) => ({
    id: m.item.id,
    title: m.item.title,
    type: m.item.type as KnowledgeType,
  }));

  return {
    answer: parsedResponse.answer,
    recommendedAction: parsedResponse.recommendedAction,
    why: parsedResponse.why,
    relevantContext: parsedResponse.relevantContext,
    confidence: parsedResponse.confidence,
    isSufficientEvidence: true,
    citations,
    relatedKnowledge,
  };
}
