import { prisma } from './prisma';

export interface CategoryCoverageDetail {
  category: string;
  score: number; // 0 to 100
  status: 'STRONG' | 'MODERATE' | 'WEAK' | 'CRITICAL_GAP';
  capturedItemsCount: number;
  expectedItemsCount: number;
  verifiedCount: number;
  averageConfidence: number;
  explanation: string;
}

export interface ComprehensiveCoverageReport {
  overallCoverage: number; // 0 to 100
  categories: CategoryCoverageDetail[];
  totalCapturedItems: number;
  criticalGapsCount: number;
  formulaExplanation: {
    weightedCaptured: number;
    weightedExpected: number;
    description: string;
    weights: {
      criticalRiskMultiplier: number;
      importanceWeight: number;
      verificationBonus: number;
      freshnessPenalty: number;
    };
  };
}

const CATEGORY_MAP: Record<string, string[]> = {
  Architecture: ['ARCHITECTURE'],
  Deployment: ['PROCESS', 'BEST_PRACTICE'],
  Troubleshooting: ['TROUBLESHOOTING', 'SOLUTION', 'KNOWN_BUG'],
  'Business Rules': ['BUSINESS_RULE', 'DECISION'],
  'Edge Cases': ['EDGE_CASE', 'WARNING'],
  Dependencies: ['DEPENDENCY'],
  'Operational Tips': ['OPERATIONAL_TIP'],
  'Known Problems': ['KNOWN_BUG', 'WARNING'],
};

// Realistic operational expectations per project/domain for enterprise teams
const CATEGORY_EXPECTED_WEIGHTS: Record<string, number> = {
  Architecture: 2,
  Deployment: 2,
  Troubleshooting: 3,
  'Business Rules': 2,
  'Edge Cases': 2,
  Dependencies: 2,
  'Operational Tips': 2,
  'Known Problems': 2,
};

export async function calculateCoverageForEmployee(
  employeeId?: string,
  projectId?: string
): Promise<ComprehensiveCoverageReport> {
  let whereClause: any = { status: 'APPROVED' };

  if (employeeId) {
    // If calculating for employee, include both their directly authored items
    // and items in projects they lead/own
    const empProjects = await prisma.employeeProject.findMany({
      where: { employeeId },
      select: { projectId: true },
    });
    const pIds = empProjects.map((p) => p.projectId);

    whereClause = {
      status: 'APPROVED',
      OR: [
        { employeeId },
        { projectId: { in: pIds } },
      ],
    };
  } else if (projectId) {
    whereClause.projectId = projectId;
  }

  const items = await prisma.knowledgeItem.findMany({
    where: whereClause,
  });

  const categories: CategoryCoverageDetail[] = [];
  let totalWeightedCaptured = 0;
  let totalWeightedExpected = 0;
  let criticalGaps = 0;

  for (const [categoryName, matchingTypes] of Object.entries(CATEGORY_MAP)) {
    const categoryItems = items.filter((it) => matchingTypes.includes(it.type));
    const expected = CATEGORY_EXPECTED_WEIGHTS[categoryName] || 2;

    let categoryScoreSum = 0;
    let verifiedCount = 0;
    let confidenceSum = 0;

    for (const it of categoryItems) {
      // Risk factor: CRITICAL items carry 1.5x weight, HIGH 1.25x
      let riskMult = 1.0;
      if (it.risk === 'CRITICAL') riskMult = 1.5;
      else if (it.risk === 'HIGH') riskMult = 1.25;

      // Verification bonus
      let verBonus = 1.0;
      if (it.lastVerifiedAt) {
        verifiedCount++;
        verBonus = 1.15;
      }

      // Freshness factor
      let freshMult = 1.0;
      if (it.freshness === 'AGING') freshMult = 0.85;
      else if (it.freshness === 'STALE') freshMult = 0.65;

      const itemScore = (it.importance / 10) * it.confidence * riskMult * verBonus * freshMult * 10;
      categoryScoreSum += itemScore;
      confidenceSum += it.confidence;
    }

    const avgConfidence = categoryItems.length > 0 ? confidenceSum / categoryItems.length : 0.5;

    // Normalizing category score to 0 - 100
    const rawRatio = expected > 0 ? (categoryScoreSum / (expected * 10)) * 100 : 0;
    const finalCategoryScore = Math.min(100, Math.round(rawRatio));

    let status: 'STRONG' | 'MODERATE' | 'WEAK' | 'CRITICAL_GAP' = 'MODERATE';
    if (finalCategoryScore >= 75) status = 'STRONG';
    else if (finalCategoryScore >= 50) status = 'MODERATE';
    else if (finalCategoryScore >= 30) status = 'WEAK';
    else {
      status = 'CRITICAL_GAP';
      criticalGaps++;
    }

    let explanation = '';
    if (status === 'STRONG') {
      explanation = `Well-documented domain with ${categoryItems.length} active verified procedures and high confidence.`;
    } else if (status === 'MODERATE') {
      explanation = `Core documentation exists (${categoryItems.length} items), but deeper failure recovery details remain unrecorded.`;
    } else if (status === 'WEAK') {
      explanation = `High vulnerability: Only ${categoryItems.length} items recorded against ${expected} expected operational scenarios.`;
    } else {
      explanation = `CRITICAL DEFICIT: Tacit employee experience is completely undocumented. Significant disruption risk if key person leaves.`;
    }

    categories.push({
      category: categoryName,
      score: finalCategoryScore,
      status,
      capturedItemsCount: categoryItems.length,
      expectedItemsCount: expected,
      verifiedCount,
      averageConfidence: Number(avgConfidence.toFixed(2)),
      explanation,
    });

    totalWeightedCaptured += categoryScoreSum;
    totalWeightedExpected += expected * 10;
  }

  const overallCoverage = Math.min(
    100,
    Math.round((totalWeightedCaptured / Math.max(1, totalWeightedExpected)) * 100)
  );

  // If this was for an employee, update employee's knowledgeCoverage in the database
  if (employeeId) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        knowledgeCoverage: overallCoverage,
      },
    });
  }

  // If this was for a project, update project's coverageScore in the database
  if (projectId) {
    const arch = categories.find((c) => c.category === 'Architecture')?.score || 0;
    const dep = categories.find((c) => c.category === 'Deployment')?.score || 0;
    const trb = categories.find((c) => c.category === 'Troubleshooting')?.score || 0;
    const biz = categories.find((c) => c.category === 'Business Rules')?.score || 0;
    const edg = categories.find((c) => c.category === 'Edge Cases')?.score || 0;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        coverageScore: overallCoverage,
        architectureScore: arch,
        deploymentScore: dep,
        troubleshootingScore: trb,
        businessRulesScore: biz,
        edgeCasesScore: edg,
      },
    });
  }

  return {
    overallCoverage,
    categories,
    totalCapturedItems: items.length,
    criticalGapsCount: criticalGaps,
    formulaExplanation: {
      weightedCaptured: Math.round(totalWeightedCaptured),
      weightedExpected: Math.round(totalWeightedExpected),
      description:
        'Overall Coverage = (Sum of [Item Importance × Confidence × Risk Weight × Verification Bonus × Freshness Factor]) / Total Weighted Expected Knowledge Base',
      weights: {
        criticalRiskMultiplier: 1.5,
        importanceWeight: 1.0,
        verificationBonus: 1.15,
        freshnessPenalty: 0.85,
      },
    },
  };
}
