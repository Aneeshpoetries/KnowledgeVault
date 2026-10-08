import { offlineGaps, offlineKnowledge } from './offline-demo';
import type { ChatAnswerResponse, ExtractedKnowledgeItemDTO } from './types';
import { assistantPrompts } from './assistant-prompts';

const prefix = 'knowledgevault-demo-v1:';

export const seedReviews = offlineKnowledge.map((item, index) => ({
  ...item,
  status: 'PENDING_REVIEW',
  createdAt: `2026-10-0${7 - index}T09:00:00.000Z`,
}));

export function readDemo<T>(name: string, seed: T): T {
  if (typeof window === 'undefined') return seed;
  try {
    const saved = window.localStorage.getItem(prefix + name);
    return saved === null ? seed : JSON.parse(saved) as T;
  } catch {
    return seed;
  }
}

export function writeDemo<T>(name: string, value: T): T {
  try { window.localStorage.setItem(prefix + name, JSON.stringify(value)); } catch {}
  window.dispatchEvent(new CustomEvent('knowledgevault-demo-change', { detail: name }));
  return value;
}

export function resetDemo(): void {
  for (let index = window.localStorage.length - 1; index >= 0; index--) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(prefix)) window.localStorage.removeItem(key);
  }
  window.dispatchEvent(new CustomEvent('knowledgevault-demo-change'));
}

export function demoKnowledge() { return readDemo('knowledge', offlineKnowledge); }
export function demoReviews() { return readDemo('reviews', seedReviews); }
export function demoGaps() { return readDemo('gaps', offlineGaps); }

export function saveDemoKnowledge(items: any[]) { return writeDemo('knowledge', items); }
export function saveDemoReviews(items: any[]) { return writeDemo('reviews', items); }
export function saveDemoGaps(items: any[]) { return writeDemo('gaps', items); }

export function captureDemo(text: string, title: string, sourceType = 'NOTES', author = 'Demo contributor'): ExtractedKnowledgeItemDTO {
  const content = text.trim();
  const item: ExtractedKnowledgeItemDTO = {
    title: title.trim() || 'Captured operational context',
    summary: content.split(/[.!?]\s/)[0].slice(0, 160), content,
    type: 'PROCESS', risk: 'HIGH', importance: 8, confidence: 0.85,
    technologies: [], reasoning: 'Captured from a local demo contribution.',
    relatedEntities: [], dependencies: [], problems: [], solutions: [],
    source: sourceType, sourceExcerpt: content.slice(0, 260),
  };
  const record = {
    ...item, id: `demo-capture-${Date.now()}`, freshness: 'FRESH', status: 'PENDING_REVIEW',
    source: { name: title || 'Demo capture', type: sourceType },
    employee: { id: 'demo-rahul', name: author },
    project: { id: 'demo-payment', name: 'Payment System' },
    originalSourceText: content, verifiedBy: author, lastVerifiedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    problemsJson: '[]', solutionsJson: '[]', dependenciesJson: '[]', whyItMatters: 'Preserves operational context for the team.',
  };
  saveDemoKnowledge([record, ...demoKnowledge()] as any);
  saveDemoReviews([record, ...demoReviews()] as any);
  return item;
}

export function demoAnswer(query: string): ChatAnswerResponse {
  const saved = assistantPrompts.find(prompt => prompt.query.toLowerCase() === query.trim().toLowerCase());
  if (saved && saved.memoryId === null) {
    const gaps = demoGaps();
    return {
      answer: gaps.length ? '## Procedures needing capture\n\n' + gaps.map(gap => `- **${gap.title}** — ${gap.description}`).join('\n') : 'There are no open gaps in this demo workspace.',
      why: 'These are the current open gaps in the demo snapshot, rather than verified recovery instructions.',
      relevantContext: '', confidence: 0, isSufficientEvidence: false,
      knowledgeGapDetected: gaps.length > 0,
      gapDetails: gaps.length ? { title: 'Open production gaps', description: 'Capture these procedures with their owners, then request human verification.', category: 'Troubleshooting' } : undefined,
      citations: [], relatedKnowledge: [],
    };
  }
  const words = query.toLowerCase().match(/[a-z0-9]+/g) || [];
  const ranked = demoKnowledge().map((item) => ({
    item,
    score: words.filter((word) => word.length > 3 && `${item.title} ${item.summary} ${item.content}`.toLowerCase().includes(word)).length,
  })).sort((a, b) => b.score - a.score);
  const savedItem = saved?.memoryId ? demoKnowledge().find(item => item.id === saved.memoryId) : undefined;
  const match = savedItem ? { item: savedItem, score: 1 } : ranked[0];
  if (!match || match.score === 0) {
    return {
      answer: 'I could not find a verified demo memory for that question.',
      why: 'The local demo snapshot has no matching evidence.',
      relevantContext: '', confidence: 0, isSufficientEvidence: false,
      knowledgeGapDetected: true,
      gapDetails: { title: query, description: 'No matching verified memory exists in the demo snapshot.', category: 'Uncovered question' },
      citations: [], relatedKnowledge: [],
    };
  }
  const item = match.item;
  return {
    answer: item.summary + '\n\n' + item.content,
    recommendedAction: item.summary,
    why: item.whyItMatters,
    relevantContext: item.content,
    confidence: item.confidence,
    isSufficientEvidence: true,
    citations: [{ id: item.id, title: item.title, type: item.type as ChatAnswerResponse['citations'][number]['type'], sourceName: item.source.name, sourceType: item.source.type, excerpt: item.originalSourceText, confidence: item.confidence, risk: item.risk as ChatAnswerResponse['citations'][number]['risk'], projectName: item.project.name }],
    relatedKnowledge: [{ id: item.id, title: item.title, type: item.type as ChatAnswerResponse['relatedKnowledge'][number]['type'] }],
  };
}
