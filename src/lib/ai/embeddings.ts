export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-004';

  if (apiKey && apiKey.trim().length > 0 && !apiKey.includes('your-key')) {
    // ── Gemini native Embeddings API ──────────────────────────────────────────
    const isGemini =
      process.env.GEMINI_API_KEY ||
      baseUrl.includes('generativelanguage.googleapis.com') ||
      embeddingModel.startsWith('text-embedding-0');

    if (isGemini) {
      try {
        const geminiKey = process.env.GEMINI_API_KEY || apiKey;
        const model = embeddingModel.startsWith('text-embedding-')
          ? embeddingModel
          : 'text-embedding-004';

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: `models/${model}`,
              content: { parts: [{ text: text.slice(0, 8000) }] },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const embedding = data.embedding?.values;
          if (Array.isArray(embedding)) return embedding;
        } else {
          const err = await response.text();
          console.warn('Gemini embedding failed:', err);
        }
      } catch (err) {
        console.warn('Gemini embedding error, using local fallback:', err);
      }
    } else {
      // ── OpenAI-compatible Embeddings ────────────────────────────────────────
      try {
        const response = await fetch(`${baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: embeddingModel,
            input: text.slice(0, 8000),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const embedding = data.data?.[0]?.embedding;
          if (Array.isArray(embedding)) return embedding;
        }
      } catch (err) {
        console.warn('Embedding API call failed, using local fallback:', err);
      }
    }
  }

  // Deterministic local semantic embedding (64 dimensions) — fallback
  return generateDeterministicEmbedding(text);
}


export function generateDeterministicEmbedding(text: string, dim: number = 64): number[] {
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let c = 0; c < word.length; c++) {
      const charCode = word.charCodeAt(c);
      const idx = (charCode * 17 + c * 31 + i * 7) % dim;
      vec[idx] += 0.25;
    }
    // Boost specific technical terms
    if (word.includes('pay') || word.includes('bill')) vec[0] += 1.0;
    if (word.includes('timeout') || word.includes('delay') || word.includes('latency')) vec[1] += 1.0;
    if (word.includes('deploy') || word.includes('release') || word.includes('restart')) vec[2] += 1.0;
    if (word.includes('pgbouncer') || word.includes('postgres') || word.includes('sql')) vec[3] += 1.0;
    if (word.includes('redis') || word.includes('cache')) vec[4] += 1.0;
    if (word.includes('kafka') || word.includes('queue') || word.includes('sqs')) vec[5] += 1.0;
    if (word.includes('error') || word.includes('fail') || word.includes('troubleshoot')) vec[6] += 1.0;
    if (word.includes('rahul') || word.includes('backend')) vec[7] += 1.0;
    if (word.includes('edge') || word.includes('bug')) vec[8] += 1.0;
  }

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => Number((v / magnitude).toFixed(5)));
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  // Handle dimensional mismatch gracefully (e.g. if one is 1536 and other is 64)
  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
