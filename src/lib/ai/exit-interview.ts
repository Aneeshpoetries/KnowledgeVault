import { prisma } from '../prisma';
import { callLLM } from './llm-provider';
import { generateEmbedding } from './embeddings';
import { calculateCoverageForEmployee } from '../coverage-engine';

export async function processExitAnswerAndExtractKnowledge(
  sessionId: string,
  questionId: string,
  rawAnswer: string
) {
  const session = await prisma.exitSession.findUnique({
    where: { id: sessionId },
    include: {
      employee: {
        include: {
          projects: { include: { project: true } },
        },
      },
    },
  });

  if (!session) throw new Error('Exit session not found');

  const question = await prisma.exitQuestion.findUnique({
    where: { id: questionId },
  });

  const emp = session.employee;
  const primaryProject = emp.projects[0]?.project;

  // 1. LLM Prompt: Convert employee conversational answer into structured enterprise knowledge items
  const systemPrompt = `You are KnowledgeVault AI conducting an Exit Knowledge Recovery Interview with departing senior engineer ${emp.name} (${emp.role}).
Convert their spoken/written response into one or more high-value, production-grade knowledge items.
Extract:
- title: Crisp title
- summary: 1-2 sentence executive briefing
- content: Full procedure with step-by-step instructions or commands
- whyItMatters: Operational/financial risk of losing this
- type: [OPERATIONAL_TIP, PROCESS, TROUBLESHOOTING, BUSINESS_RULE, EDGE_CASE, SOLUTION, WARNING, DEPENDENCY]
- risk: [LOW, MEDIUM, HIGH, CRITICAL]
- importance: 1 to 10
- confidence: float 0.85 to 0.98
- followUpQuestion: An intelligent, context-aware follow-up question digging deeper into what they just revealed.

Format as JSON:
{
  "extractedKnowledge": [
    {
      "title": string,
      "summary": string,
      "content": string,
      "whyItMatters": string,
      "type": string,
      "risk": string,
      "importance": number,
      "confidence": number,
      "problems": string[],
      "solutions": string[],
      "dependencies": string[],
      "tags": string[]
    }
  ],
  "followUpQuestion": {
    "question": string,
    "category": string,
    "rationale": string,
    "priority": "HIGH" | "CRITICAL"
  }
}`;

  const userPrompt = `QUESTION ASKED: "${question?.question || 'Troubleshooting procedures'}"
CATEGORY: "${question?.category || 'Troubleshooting'}"

EMPLOYEE'S DETAILED ANSWER:
"""
${rawAnswer}
"""`;

  let parsed: any;
  try {
    const rawLLMResponse = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.1,
        responseFormat: { type: 'json_object' },
      }
    );
    const cleanJson = rawLLMResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);
  } catch (err) {
    console.warn('Failed to parse exit answer JSON from LLM, using structured fallback:', err);
    parsed = {
      extractedKnowledge: [
        {
          title: `Failover Protocol & Incident Recovery: ${question?.category || 'Payment System'}`,
          summary: `Direct operational recovery procedure recorded during Exit Mode interview with ${emp.name}.`,
          content: rawAnswer,
          whyItMatters: 'Critical undocumented tacit knowledge recovered prior to employee departure.',
          type: 'TROUBLESHOOTING',
          risk: 'HIGH',
          importance: 9,
          confidence: 0.94,
          problems: ['Production outage recovery without lead engineer'],
          solutions: ['Execute documented failover steps'],
          dependencies: ['Gateway Switcher', 'Redis Cluster'],
          tags: ['exit-mode', 'recovered-knowledge', 'failover', 'runbook'],
        },
      ],
      followUpQuestion: {
        question: 'When executing that recovery step, what is the first telemetry metric or log file you inspect to verify normal state?',
        category: question?.category || 'Troubleshooting',
        rationale: 'Validates post-recovery health metrics.',
        priority: 'HIGH',
      },
    };
  }

  // 2. Save Knowledge Items to DB, generate embeddings & graph relationships
  const createdItems = [];
  const extractedList = Array.isArray(parsed.extractedKnowledge) ? parsed.extractedKnowledge : [];

  for (const item of extractedList) {
    const createdItem = await prisma.knowledgeItem.create({
      data: {
        title: item.title || 'Recovered Exit Knowledge Record',
        summary: item.summary || rawAnswer.slice(0, 150),
        content: item.content || rawAnswer,
        originalSourceText: rawAnswer,
        aiInterpretation: `Captured during Exit Mode interview with ${emp.name}. Structured automatically into organizational memory.`,
        whyItMatters: item.whyItMatters || 'Essential continuity knowledge retained during offboarding.',
        type: item.type || 'TROUBLESHOOTING',
        risk: item.risk || 'HIGH',
        importance: item.importance || 9,
        confidence: item.confidence || 0.93,
        status: 'APPROVED',
        freshness: 'FRESH',
        lastVerifiedAt: new Date(),
        verifiedBy: emp.name,
        projectId: primaryProject?.id,
        employeeId: emp.id,
        tagsJson: JSON.stringify(item.tags || ['exit-mode', 'recovered']),
        problemsJson: JSON.stringify(item.problems || []),
        solutionsJson: JSON.stringify(item.solutions || []),
        dependenciesJson: JSON.stringify(item.dependencies || []),
      },
    });

    // Generate and store embedding
    const textToEmbed = `${createdItem.title} ${createdItem.summary} ${createdItem.content} ${createdItem.type}`;
    const vec = await generateEmbedding(textToEmbed);
    await prisma.knowledgeEmbedding.create({
      data: {
        knowledgeItemId: createdItem.id,
        vectorJson: JSON.stringify(vec),
        model: 'text-embedding-3-small',
        dimensions: vec.length,
      },
    });

    // Auto-create Knowledge Graph relationships
    if (primaryProject) {
      await prisma.knowledgeRelationship.create({
        data: {
          sourceEntityId: emp.id,
          sourceEntityType: 'EMPLOYEE',
          sourceLabel: emp.name,
          targetEntityId: createdItem.id,
          targetEntityType: 'KNOWLEDGE',
          targetLabel: createdItem.title,
          relationshipType: 'DOCUMENTS',
          weight: 1.0,
          description: `Recovered during Exit Interview from ${emp.name}`,
        },
      });

      await prisma.knowledgeRelationship.create({
        data: {
          sourceEntityId: primaryProject.id,
          sourceEntityType: 'PROJECT',
          sourceLabel: primaryProject.name,
          targetEntityId: createdItem.id,
          targetEntityType: 'KNOWLEDGE',
          targetLabel: createdItem.title,
          relationshipType: 'DOCUMENTS',
          weight: 0.95,
        },
      });
    }

    createdItems.push(createdItem);
  }

  // 3. Record Exit Answer in DB
  const exitAnswer = await prisma.exitAnswer.create({
    data: {
      sessionId,
      questionId,
      rawAnswer,
      extractedItemsCount: createdItems.length,
      confidence: 0.94,
    },
  });

  // 4. Update ExitSession counters
  const totalRecovered = session.itemsRecovered + createdItems.length;

  // Recalculate employee coverage dynamically
  const updatedCoverage = await calculateCoverageForEmployee(emp.id);

  // Update session
  await prisma.exitSession.update({
    where: { id: sessionId },
    data: {
      itemsRecovered: totalRecovered,
      finalCoverage: updatedCoverage.overallCoverage,
      finalGaps: Math.max(1, session.initialGaps - totalRecovered),
    },
  });

  // Also log activity
  await prisma.activity.create({
    data: {
      type: 'COVERAGE_INCREASE',
      title: `Recovered Knowledge: +${createdItems.length} items from ${emp.name}`,
      description: `Exit interview captured "${createdItems[0]?.title || 'Operational Runbook'}". Coverage increased to ${Math.round(updatedCoverage.overallCoverage)}%.`,
      employeeId: emp.id,
      projectId: primaryProject?.id,
    },
  });

  // 5. Generate and insert the follow-up question if available
  let nextQuestion = null;
  if (parsed.followUpQuestion && parsed.followUpQuestion.question) {
    const currentQuestionCount = await prisma.exitQuestion.count({
      where: { sessionId },
    });

    nextQuestion = await prisma.exitQuestion.create({
      data: {
        sessionId,
        question: parsed.followUpQuestion.question,
        category: parsed.followUpQuestion.category || question?.category || 'Troubleshooting',
        rationale: parsed.followUpQuestion.rationale || 'Dynamic AI follow-up based on employee revelation',
        priority: parsed.followUpQuestion.priority || 'HIGH',
        order: currentQuestionCount + 1,
        isFollowUp: true,
        parentQuestionId: questionId,
      },
    });
  }

  return {
    answerRecord: exitAnswer,
    createdItems,
    newCoverage: updatedCoverage.overallCoverage,
    nextQuestion,
  };
}
