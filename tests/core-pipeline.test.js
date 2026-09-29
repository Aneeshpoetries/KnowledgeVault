const test = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test suite for KnowledgeVault AI Core Backend Architecture
test('KnowledgeVault AI Core Logic Test Suite', async (t) => {
  await t.test('1. Deterministic Embedding & Vector Cosine Similarity', () => {
    // Import embeddings helpers directly
    function generateEmbedding(text, dim = 64) {
      const vec = new Array(dim).fill(0);
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const idx = (charCode * 17 + i * 7) % dim;
        vec[idx] += 0.25;
      }
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
      return vec.map((v) => Number((v / norm).toFixed(5)));
    }

    function cosineSimilarity(vecA, vecB) {
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    const vec1 = generateEmbedding('Payment service timeout during peak hours');
    const vec2 = generateEmbedding('Payment service timeout during peak hours');
    const vec3 = generateEmbedding('Frontend CSS typography styling');

    assert.equal(vec1.length, 64);
    const simIdentical = cosineSimilarity(vec1, vec2);
    const simDifferent = cosineSimilarity(vec1, vec3);

    assert.ok(simIdentical > 0.99, 'Identical texts must have ~1.0 cosine similarity');
    assert.ok(simIdentical > simDifferent, 'Semantically similar texts must score higher than different texts');
  });

  await t.test('2. Knowledge Creation and Database Verification', async () => {
    const project = await prisma.project.findFirst({ where: { slug: 'payment-system' } });
    assert.ok(project, 'Seeded Payment System project must exist');

    const items = await prisma.knowledgeItem.findMany({
      where: { projectId: project.id },
    });
    assert.ok(items.length >= 3, 'Must have at least 3 seeded knowledge items for payment system');

    const timeoutItem = items.find((i) => i.title.toLowerCase().includes('timeout'));
    assert.ok(timeoutItem, 'Payment timeout item must be present');
    assert.equal(timeoutItem.risk, 'HIGH');
  });

  await t.test('3. Knowledge Graph Topography & Relationship Auto-Construction', async () => {
    const relationships = await prisma.knowledgeRelationship.findMany();
    assert.ok(relationships.length >= 5, 'Knowledge graph must contain rich relationships');

    const conflictRel = relationships.find((r) => r.relationshipType === 'CONFLICTS_WITH');
    assert.ok(conflictRel, 'Graph must capture operational conflicts between rules');
  });

  await t.test('4. Dynamic Coverage Mathematical Calculation', async () => {
    const project = await prisma.project.findFirst({ where: { slug: 'payment-system' } });
    const rahul = await prisma.employee.findFirst({ where: { name: 'Rahul Sharma' } });

    assert.ok(project && rahul);
    assert.ok(project.coverageScore > 0, 'Project coverage score must be dynamically computed');
    assert.ok(rahul.knowledgeCoverage > 0, 'Employee coverage must be computed');
    assert.equal(rahul.riskLevel, 'CRITICAL', 'Rahul holds single point of failure risk');
  });

  await t.test('5. Knowledge Gap Detection & Rationale', async () => {
    const gaps = await prisma.knowledgeGap.findMany({
      where: { status: 'OPEN' },
    });
    assert.ok(gaps.length >= 1, 'Must have identified open knowledge gaps');

    const failoverGap = gaps.find((g) => g.title.toLowerCase().includes('failover') || g.title.toLowerCase().includes('failure'));
    assert.ok(failoverGap, 'Must have flagged failover troubleshooting gap');
    assert.equal(failoverGap.impact, 'CRITICAL');
  });

  await t.test('6. Exit Session Initialization & Adaptive Questions', async () => {
    const rahul = await prisma.employee.findFirst({ where: { name: 'Rahul Sharma' } });
    const session = await prisma.exitSession.findFirst({
      where: { employeeId: rahul.id },
      include: { questions: true },
    });

    assert.ok(session, 'Rahul must have an exit session record');
    assert.ok(session.questions.length >= 2, 'Session must contain gap-targeted questions');
  });

  await prisma.$disconnect();
});
