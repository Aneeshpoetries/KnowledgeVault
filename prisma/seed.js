const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateDeterministicEmbedding(text, dim = 64) {
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let c = 0; c < word.length; c++) {
      const charCode = word.charCodeAt(c);
      const idx = (charCode * 17 + c * 31 + i * 7) % dim;
      vec[idx] += 0.25;
    }
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

  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => Number((v / magnitude).toFixed(5)));
}

async function main() {
  console.log('Seeding KnowledgeVault AI database with enterprise NovaTech data...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.knowledgeConflict.deleteMany();
  await prisma.exitAnswer.deleteMany();
  await prisma.exitQuestion.deleteMany();
  await prisma.exitSession.deleteMany();
  await prisma.coverageScore.deleteMany();
  await prisma.knowledgeGap.deleteMany();
  await prisma.knowledgeRelationship.deleteMany();
  await prisma.knowledgeEmbedding.deleteMany();
  await prisma.knowledgeItem.deleteMany();
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeSource.deleteMany();
  await prisma.employeeTechnology.deleteMany();
  await prisma.projectTechnology.deleteMany();
  await prisma.employeeProject.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  // 1. Employees
  const rahul = await prisma.employee.create({
    data: {
      name: 'Rahul Sharma',
      role: 'Senior Backend Developer',
      department: 'Core Infrastructure & Payments',
      email: 'rahul.sharma@novatech.internal',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Lead architect of NovaTech payment engine for 4 years. Single point of contact for legacy settlement workflows.',
      riskLevel: 'CRITICAL',
      knowledgeCoverage: 54.0,
      criticalKnowledgeCount: 8,
      atRiskKnowledgeCount: 14,
      concentrationRatio: 73.0,
      isExitModeActive: true,
      joinedDate: new Date('2022-03-15'),
    },
  });

  const priya = await prisma.employee.create({
    data: {
      name: 'Priya Mehta',
      role: 'Staff Frontend Engineer',
      department: 'Design Systems & Portal',
      email: 'priya.mehta@novatech.internal',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      bio: 'Creator of NovaTech Unified UI kit, SSR hydration optimization lead.',
      riskLevel: 'MEDIUM',
      knowledgeCoverage: 78.0,
      criticalKnowledgeCount: 3,
      atRiskKnowledgeCount: 5,
      concentrationRatio: 42.0,
      joinedDate: new Date('2022-08-01'),
    },
  });

  const arjun = await prisma.employee.create({
    data: {
      name: 'Arjun Verma',
      role: 'Principal DevOps & SRE Engineer',
      department: 'Cloud Platform & Reliability',
      email: 'arjun.verma@novatech.internal',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Maintains AWS multi-region Kubernetes clusters, Kafka pipeline, and zero-trust IAM networks.',
      riskLevel: 'HIGH',
      knowledgeCoverage: 68.0,
      criticalKnowledgeCount: 6,
      atRiskKnowledgeCount: 11,
      concentrationRatio: 65.0,
      joinedDate: new Date('2021-11-10'),
    },
  });

  const elena = await prisma.employee.create({
    data: {
      name: 'Elena Rostova',
      role: 'Director of Architecture',
      department: 'Enterprise Architecture',
      email: 'elena.rostova@novatech.internal',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      bio: 'Oversight across technical roadmaps, service decomposition, and compliance certifications.',
      riskLevel: 'LOW',
      knowledgeCoverage: 86.0,
      criticalKnowledgeCount: 2,
      atRiskKnowledgeCount: 3,
      concentrationRatio: 25.0,
      joinedDate: new Date('2020-04-12'),
    },
  });

  // 2. Demo Users for authentication
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@novatech.ai',
      role: 'ADMIN',
      title: 'VP of Engineering',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Sarah Chen (Manager)',
      email: 'manager@novatech.ai',
      role: 'MANAGER',
      title: 'Engineering Manager - Payments',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@novatech.ai',
      role: 'EMPLOYEE',
      title: 'Senior Backend Developer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      employeeId: rahul.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'newhire@novatech.ai',
      role: 'NEW_EMPLOYEE',
      title: 'Associate Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  // 3. Projects
  const paymentProject = await prisma.project.create({
    data: {
      name: 'Payment System',
      slug: 'payment-system',
      description: 'Core transactional backbone handling card charges, ACH transfers, idempotency tokens, and ledger settlements.',
      department: 'Core Engineering',
      status: 'ACTIVE',
      riskLevel: 'CRITICAL',
      coverageScore: 54.0,
      architectureScore: 90.0,
      deploymentScore: 70.0,
      troubleshootingScore: 50.0,
      businessRulesScore: 40.0,
      edgeCasesScore: 20.0,
    },
  });

  const portalProject = await prisma.project.create({
    data: {
      name: 'Customer Portal',
      slug: 'customer-portal',
      description: 'Next.js 15 client dashboard providing invoice downloads, card management, and subscription telemetry.',
      department: 'Frontend Engineering',
      status: 'ACTIVE',
      riskLevel: 'LOW',
      coverageScore: 78.0,
      architectureScore: 85.0,
      deploymentScore: 80.0,
      troubleshootingScore: 75.0,
      businessRulesScore: 80.0,
      edgeCasesScore: 70.0,
    },
  });

  const analyticsProject = await prisma.project.create({
    data: {
      name: 'Analytics Platform',
      slug: 'analytics-platform',
      description: 'High-throughput Kafka streaming pipeline feeding ClickHouse and aggregate data marts.',
      department: 'Data Platform',
      status: 'ACTIVE',
      riskLevel: 'MEDIUM',
      coverageScore: 64.0,
      architectureScore: 80.0,
      deploymentScore: 65.0,
      troubleshootingScore: 60.0,
      businessRulesScore: 55.0,
      edgeCasesScore: 45.0,
    },
  });

  // Project-Employee mappings
  await prisma.employeeProject.createMany({
    data: [
      { employeeId: rahul.id, projectId: paymentProject.id, role: 'Lead Architect' },
      { employeeId: arjun.id, projectId: paymentProject.id, role: 'Infrastructure Lead' },
      { employeeId: priya.id, projectId: portalProject.id, role: 'Frontend Lead' },
      { employeeId: rahul.id, projectId: analyticsProject.id, role: 'Integration Specialist' },
      { employeeId: elena.id, projectId: paymentProject.id, role: 'Architecture Reviewer' },
      { employeeId: elena.id, projectId: portalProject.id, role: 'Architecture Reviewer' },
      { employeeId: elena.id, projectId: analyticsProject.id, role: 'Architecture Reviewer' },
    ],
  });

  // 4. Technologies
  const java = await prisma.technology.create({ data: { name: 'Java', category: 'Backend', version: '21 LTS' } });
  const spring = await prisma.technology.create({ data: { name: 'Spring Boot', category: 'Backend', version: '3.2.3' } });
  const postgres = await prisma.technology.create({ data: { name: 'PostgreSQL', category: 'Database', version: '16.2' } });
  const redis = await prisma.technology.create({ data: { name: 'Redis', category: 'Cache', version: '7.2' } });
  const kafka = await prisma.technology.create({ data: { name: 'Kafka', category: 'Event Streaming', version: '3.6.1' } });
  const nextjs = await prisma.technology.create({ data: { name: 'Next.js', category: 'Frontend', version: '15.1' } });
  const react = await prisma.technology.create({ data: { name: 'React', category: 'Frontend', version: '19.0' } });
  const docker = await prisma.technology.create({ data: { name: 'Docker & Kubernetes', category: 'DevOps', version: 'v1.29' } });
  const aws = await prisma.technology.create({ data: { name: 'AWS (ECS & SQS)', category: 'Cloud', version: 'Cloud' } });

  await prisma.projectTechnology.createMany({
    data: [
      { projectId: paymentProject.id, technologyId: java.id },
      { projectId: paymentProject.id, technologyId: spring.id },
      { projectId: paymentProject.id, technologyId: postgres.id },
      { projectId: paymentProject.id, technologyId: redis.id },
      { projectId: paymentProject.id, technologyId: aws.id },
      { projectId: portalProject.id, technologyId: nextjs.id },
      { projectId: portalProject.id, technologyId: react.id },
      { projectId: analyticsProject.id, technologyId: kafka.id },
      { projectId: analyticsProject.id, technologyId: postgres.id },
    ],
  });

  await prisma.employeeTechnology.createMany({
    data: [
      { employeeId: rahul.id, technologyId: java.id, proficiency: 'EXPERT' },
      { employeeId: rahul.id, technologyId: spring.id, proficiency: 'EXPERT' },
      { employeeId: rahul.id, technologyId: redis.id, proficiency: 'EXPERT' },
      { employeeId: rahul.id, technologyId: postgres.id, proficiency: 'EXPERT' },
      { employeeId: priya.id, technologyId: react.id, proficiency: 'EXPERT' },
      { employeeId: priya.id, technologyId: nextjs.id, proficiency: 'EXPERT' },
      { employeeId: arjun.id, technologyId: docker.id, proficiency: 'EXPERT' },
      { employeeId: arjun.id, technologyId: aws.id, proficiency: 'EXPERT' },
      { employeeId: arjun.id, technologyId: kafka.id, proficiency: 'INTERMEDIATE' },
    ],
  });

  // 5. Knowledge Sources
  const sourceMeeting = await prisma.knowledgeSource.create({
    data: {
      title: 'Payment Deployment Incident Review – March 12',
      type: 'MEETING',
      fileName: 'payment-incident-march12-transcript.txt',
      fileSize: 14200,
      mimeType: 'text/plain',
      rawText: 'Discussion regarding the catastrophic outage during the Q1 payment gateway rollout. Rahul Sharma noted that the API gateway timeout was set to 5000ms while Chase Paymentech 3DS v2 takes up to 8500ms on peak traffic. Also discussed: Never restart payment service during billing hours.',
      status: 'PROCESSED',
      confidence: 0.94,
      extractedCount: 5,
      highRiskCount: 3,
      processedAt: new Date(),
    },
  });

  const sourceRunbook = await prisma.knowledgeSource.create({
    data: {
      title: 'Payment Service Architecture & Deployment Guide v3.4',
      type: 'DOCUMENT',
      fileName: 'payment-service-deployment-guide.md',
      fileSize: 38400,
      mimeType: 'text/markdown',
      rawText: '# Payment Service Runbook\nDeployment requires verifying Redis cluster replica lag and setting PgBouncer pool max connections to 80. Ensure zero-downtime rolling restart with 30s readiness probe grace period.',
      status: 'PROCESSED',
      confidence: 0.91,
      extractedCount: 8,
      highRiskCount: 2,
      processedAt: new Date(),
    },
  });

  const sourceSlack = await prisma.knowledgeSource.create({
    data: {
      title: 'Core Infrastructure SRE Slack #incident-room Export',
      type: 'SLACK',
      fileName: 'slack-incident-room-export.json',
      fileSize: 52100,
      mimeType: 'application/json',
      rawText: 'Thread: PgBouncer connection exhaustion during midnight settlement cron. Rahul: "The worker batch size defaults to 50 in application.yml, but the settlement engine spawns 4 parallel sub-jobs, saturating all 120 sockets."',
      status: 'PROCESSED',
      confidence: 0.93,
      extractedCount: 6,
      highRiskCount: 2,
      processedAt: new Date(),
    },
  });

  // 6. Knowledge Items
  const item1 = await prisma.knowledgeItem.create({
    data: {
      title: 'Payment API Timeout in Peak Billing Windows',
      summary: 'Before modifying payment API or deploying new revisions, verify and increase API gateway timeout to at least 10,000ms to avoid silent 504 Gateway Timeouts under Chase 3DS traffic.',
      content: 'During peak billing hours (10:00 - 14:00 EST on month-end), third-party payment partner gateways experience 3D-Secure 2.0 biometric challenge delays that exceed 7,500ms. If the internal Envoy/Kong proxy timeout is left at default 5,000ms, client connections are severed while backend card auth actually succeeds, resulting in phantom double-charges. Always verify Redis queue depth is below 500 before triggering rolling redeploys.',
      originalSourceText: 'Whenever we update the payment API, check the timeout setting because it caused serious problems last time. Chase Paymentech 3DS v2 takes up to 8500ms during peak volume, while default gateway cut off at 5000ms.',
      aiInterpretation: 'The payment service is acutely susceptible to downstream latency variance in third-party card processing. A gateway timeout lower than 10 seconds results in state inconsistency between payment intent and transaction capture.',
      whyItMatters: 'Direct financial liability and chargeback risk. Severed connections cause users to click Retry, triggering duplicate charges if idempotency validation fails.',
      type: 'OPERATIONAL_TIP',
      risk: 'HIGH',
      importance: 9,
      confidence: 0.91,
      status: 'APPROVED',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      verifiedBy: 'Rahul Sharma',
      projectId: paymentProject.id,
      employeeId: rahul.id,
      sourceId: sourceMeeting.id,
      tagsJson: JSON.stringify(['payment', 'timeout', 'gateway', 'envoy', 'chase-paymentech', '3ds']),
      reasoning: 'Extracted with high confidence from incident post-mortem transcript. Matches real architectural behavior of Spring Boot gateway client.',
      problemsJson: JSON.stringify(['504 Gateway Timeout during peak billing windows', 'Phantom charges due to severed downstream responses']),
      solutionsJson: JSON.stringify(['Increase API gateway timeout to 10,000ms', 'Verify Redis queue depth before deployment']),
      dependenciesJson: JSON.stringify(['Envoy API Gateway', 'Chase Paymentech 3DS v2', 'Redis session cluster']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma', 'Java', 'Spring Boot']),
    },
  });

  const item2 = await prisma.knowledgeItem.create({
    data: {
      title: 'Strict Billing-Hour Execution Restriction',
      summary: 'Never restart or perform schema migrations on payment-service during active billing hours (09:00 - 18:00 EST).',
      content: 'In-flight idempotent transaction tokens are synchronized through a dual Redis/PostgreSQL write-through cache. A hard restart during billing hours invalidates memory buffers and causes transaction queue drops in SQS FIFO, causing duplicate charge retries.',
      originalSourceText: 'Do not restart payment-service during billing hours. We lost 14 transactions last month when someone bounced the pod during 11am peak billing.',
      aiInterpretation: 'Rolling restarts must be strictly restricted to the scheduled maintenance window (21:00 - 23:00 UTC) with SQS worker pause engaged first.',
      whyItMatters: 'Avoids revenue drop and unrecoverable silent ledger discrepancy.',
      type: 'BUSINESS_RULE',
      risk: 'CRITICAL',
      importance: 10,
      confidence: 0.95,
      status: 'APPROVED',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Rahul Sharma',
      projectId: paymentProject.id,
      employeeId: rahul.id,
      sourceId: sourceMeeting.id,
      tagsJson: JSON.stringify(['billing-hours', 'maintenance', 'sqs', 'restriction', 'production-safety']),
      reasoning: 'Explicit organizational policy verified across 2 incident reports.',
      problemsJson: JSON.stringify(['In-flight token invalidation', 'SQS transaction duplication']),
      solutionsJson: JSON.stringify(['Queue all maintenance outside 09:00 - 18:00 EST', 'Drain SQS consumer workers prior to rolling restart']),
      dependenciesJson: JSON.stringify(['AWS SQS FIFO', 'Redis Cache', 'Billing Engine']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma']),
      hasConflict: true,
    },
  });

  const item3 = await prisma.knowledgeItem.create({
    data: {
      title: 'Restart Service Immediately After Deployment (CONFLICTING)',
      summary: 'Automated CI/CD script triggers immediate pod bounce after docker tag update to clear JVM metaspace.',
      content: 'Legacy script in deploy-payment.sh executes kubectl rollout restart immediately after helm upgrade to flush dirty JVM metaspace allocations.',
      originalSourceText: 'Always restart the service immediately after deployment to flush dirty metaspace buffers.',
      aiInterpretation: 'Contradicts the strict billing-hour restriction rule. If deployed during midday, this script causes the exact outage prohibited by rule #2.',
      whyItMatters: 'Demonstrates active operational conflict that must be reconciled.',
      type: 'WARNING',
      risk: 'HIGH',
      importance: 8,
      confidence: 0.88,
      status: 'APPROVED',
      freshness: 'STALE',
      lastVerifiedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 days ago
      projectId: paymentProject.id,
      employeeId: arjun.id,
      sourceId: sourceRunbook.id,
      tagsJson: JSON.stringify(['deployment', 'jvm', 'conflict', 'rollback']),
      hasConflict: true,
    },
  });

  const item4 = await prisma.knowledgeItem.create({
    data: {
      title: 'PostgreSQL Connection Pool Exhaustion during Midnight Reconciliation',
      summary: 'Settlement cron job saturates PgBouncer sockets unless worker concurrency is throttled to 15.',
      content: 'The midnight batch settlement job defaults to 4 parallel thread pools each allocating up to 30 active database connections, exhausting the 100-connection client limit on PgBouncer. When this happens, API requests stall with "FATAL: remaining connection slots are reserved for non-replication superuser connections". Solution: Set `spring.batch.settlement.max-threads=15` in Kubernetes ConfigMap.',
      originalSourceText: 'PgBouncer connection exhaustion during midnight settlement cron. Rahul: The worker batch size defaults to 50 in application.yml, but the settlement engine spawns 4 parallel sub-jobs, saturating all 120 sockets.',
      aiInterpretation: 'Direct database resource contention between background batch processing and real-time payment ingestion.',
      whyItMatters: 'Midnight payments get rejected if the batch job is not throttled.',
      type: 'TROUBLESHOOTING',
      risk: 'HIGH',
      importance: 9,
      confidence: 0.93,
      status: 'APPROVED',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Rahul Sharma',
      projectId: paymentProject.id,
      employeeId: rahul.id,
      sourceId: sourceSlack.id,
      tagsJson: JSON.stringify(['postgresql', 'pgbouncer', 'settlement', 'concurrency', 'troubleshooting']),
      problemsJson: JSON.stringify(['Database connection pool exhaustion', 'Midnight payment failure']),
      solutionsJson: JSON.stringify(['Throttle settlement threads to 15', 'Increase PgBouncer reserve pool size']),
      dependenciesJson: JSON.stringify(['PostgreSQL 16', 'PgBouncer', 'Spring Batch']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma', 'PostgreSQL']),
    },
  });

  const item5 = await prisma.knowledgeItem.create({
    data: {
      title: 'Zero-Downtime Payment Service Rolling Deployment Checklist',
      summary: 'Required pre-flight checks: Redis replication health, PgBouncer pool reserve, SQS consumer drain, and 30s readiness probe grace period.',
      content: '1. Check Redis master-replica replication lag (`INFO replication` < 100ms)\n2. Verify PgBouncer has at least 30 free server connections\n3. Pre-warm new Kubernetes pods with synthetic health-check token before switching traffic\n4. Monitor Chase Paymentech HTTP 200 response ratio for 5 minutes post rollout\n5. Never run db migrations concurrently with active traffic without backwards-compatible columns.',
      originalSourceText: 'Deployment requires verifying Redis cluster replica lag and setting PgBouncer pool max connections to 80. Ensure zero-downtime rolling restart with 30s readiness probe grace period.',
      aiInterpretation: 'Structured operational checklist critical for reliable continuous deployment.',
      whyItMatters: 'Failure to follow pre-flight checks leads to intermediate 502 Bad Gateway responses during Kubernetes rolling updates.',
      type: 'PROCESS',
      risk: 'MEDIUM',
      importance: 8,
      confidence: 0.92,
      status: 'APPROVED',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Arjun Verma',
      projectId: paymentProject.id,
      employeeId: arjun.id,
      sourceId: sourceRunbook.id,
      tagsJson: JSON.stringify(['deployment', 'runbook', 'kubernetes', 'checklist']),
      problemsJson: JSON.stringify(['502 Bad Gateway during pod rollout']),
      solutionsJson: JSON.stringify(['Follow 5-step rolling deployment checklist']),
      dependenciesJson: JSON.stringify(['Kubernetes', 'Redis', 'PgBouncer']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Arjun Verma']),
    },
  });

  const item6 = await prisma.knowledgeItem.create({
    data: {
      title: 'Legacy Payment API Idempotency Key Handling Edge Case',
      summary: 'Legacy payment gateway v1.4 treats missing X-Idempotency-Key as auto-retryable instead of rejecting with 400 Bad Request.',
      content: 'Older internal mobile app versions (< v3.2) occasionally send card charge payloads without the `X-Idempotency-Key` header. Instead of throwing HTTP 400, the legacy controller synthesizes a SHA-256 hash using `userId + amount + minuteTimestamp`. If the user submits twice in the exact same minute, the second charge is silently skipped. Modern clients must always send explicit UUIDv4 idempotency keys.',
      originalSourceText: 'Older mobile app versions omit idempotency key. We synthesize a hash from user+amount+minute which causes collision if rapid tap occurs.',
      aiInterpretation: 'Subtle edge case logic preserved in legacy Spring Boot controller that new developers frequently break when refactoring.',
      whyItMatters: 'Refactoring this without understanding legacy synthesis causes either duplicate charges or dropped orders for millions of mobile users.',
      type: 'EDGE_CASE',
      risk: 'HIGH',
      importance: 8,
      confidence: 0.89,
      status: 'APPROVED',
      freshness: 'AGING',
      lastVerifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      projectId: paymentProject.id,
      employeeId: rahul.id,
      sourceId: sourceRunbook.id,
      tagsJson: JSON.stringify(['idempotency', 'legacy-api', 'mobile', 'edge-case']),
      problemsJson: JSON.stringify(['Silent order skipping on rapid tap', 'Legacy client compatibility']),
      solutionsJson: JSON.stringify(['Preserve legacy SHA-256 fallback hash generator until mobile v3.2 deprecation']),
      dependenciesJson: JSON.stringify(['Spring Boot', 'Mobile Gateway v1.4']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma', 'Java']),
    },
  });

  const item7 = await prisma.knowledgeItem.create({
    data: {
      title: 'Next.js 15 Client Hydration Mismatch with Geo-IP Header',
      summary: 'Customer portal header flashing caused by Cloudflare CF-IPCountry header mismatch between Edge SSR and browser hydration.',
      content: 'When serving localized currency in Customer Portal, Cloudflare passes `CF-IPCountry` to the Next.js server route. If the browser executes `Intl.NumberFormat` with client system locale differing from IP geo-location, React 19 emits hydration mismatch warning #418. Solution: Defer currency rendering until `useEffect` mount or pass currency explicitly through cookies.',
      originalSourceText: 'Hydration mismatch on currency symbol for European users travelling abroad. Edge gets CF-IPCountry=DE while laptop locale is en-US.',
      aiInterpretation: 'Frontend edge-rendering edge case with Next.js App Router and Cloudflare proxy headers.',
      whyItMatters: 'Causes visual layout shifts and prevents React client-side event binding.',
      type: 'KNOWN_BUG',
      risk: 'LOW',
      importance: 6,
      confidence: 0.94,
      status: 'APPROVED',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Priya Mehta',
      projectId: portalProject.id,
      employeeId: priya.id,
      sourceId: sourceRunbook.id,
      tagsJson: JSON.stringify(['nextjs', 'react', 'hydration', 'cloudflare', 'frontend']),
      problemsJson: JSON.stringify(['React Hydration Error #418', 'Currency visual flicker']),
      solutionsJson: JSON.stringify(['Use client-side hydration mount flag or cookie-based locale persistence']),
      dependenciesJson: JSON.stringify(['Next.js 15', 'React 19', 'Cloudflare']),
      relatedEntitiesJson: JSON.stringify(['Customer Portal', 'Priya Mehta', 'Next.js']),
    },
  });

  // Embeddings generation for all items
  const items = [item1, item2, item3, item4, item5, item6, item7];
  for (const it of items) {
    const textToEmbed = `${it.title} ${it.summary} ${it.content} ${it.type} ${it.whyItMatters}`;
    const vec = generateDeterministicEmbedding(textToEmbed);
    await prisma.knowledgeEmbedding.create({
      data: {
        knowledgeItemId: it.id,
        vectorJson: JSON.stringify(vec),
        model: 'deterministic-text-embedding-v1',
        dimensions: vec.length,
      },
    });
  }

  // 7. Knowledge Conflict Record
  await prisma.knowledgeConflict.create({
    data: {
      itemAId: item2.id,
      itemBId: item3.id,
      title: 'Deployment Timing vs. Strict Billing-Hour Restriction Conflict',
      description: 'Knowledge Item #2 ("Strict Billing-Hour Execution Restriction") forbids restarting the payment service between 09:00 - 18:00 EST to prevent transaction drops. However, Knowledge Item #3 ("Restart Service Immediately After Deployment") specifies automated immediate restarts after helm deploy. A mid-day deployment causes immediate conflict.',
      status: 'DETECTED',
      resolutionNotes: 'Recommended resolution: Gate automated CI/CD restart script with time-of-day condition or manual approvals during 09:00 - 18:00 EST window.',
      detectedAt: new Date(),
    },
  });

  // 8. Knowledge Gaps
  await prisma.knowledgeGap.create({
    data: {
      title: 'Production Failure Recovery & Payment Failover Handling',
      description: 'Multiple payment architecture documents describe normal flow, but there is virtually zero documented knowledge regarding manual failover to Chase secondary gateway when primary gateway hangs without returning HTTP status.',
      category: 'Troubleshooting',
      impact: 'CRITICAL',
      status: 'OPEN',
      suggestedAction: 'Conduct Exit Interview with payment owner (Rahul Sharma) to document manual switchover flags and reconciliation procedures.',
      suggestedQuestionsJson: JSON.stringify([
        'What production failures have you encountered that aren’t documented anywhere?',
        'When Chase Paymentech primary gateway hangs without responding, what is the exact manual failover command?',
        'Which payment transactions require manual ledger reconciliation after an ungraceful crash?',
      ]),
      projectId: paymentProject.id,
      employeeId: rahul.id,
      detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.knowledgeGap.create({
    data: {
      title: 'Undocumented Payment Vendor Escalation Contacts',
      description: 'No verified runbook exists detailing tier-3 on-call vendor contacts for Chase Paymentech or Visa Direct out-of-band clearance.',
      category: 'Dependencies',
      impact: 'HIGH',
      status: 'OPEN',
      suggestedAction: 'Capture personal escalation contacts and shared portal credentials before Rahul departs.',
      suggestedQuestionsJson: JSON.stringify([
        'Which vendor contacts should a replacement know about, and when should they be contacted?',
        'Who is our direct engineering liaison at Chase when automated API responses fail?',
      ]),
      projectId: paymentProject.id,
      employeeId: rahul.id,
    },
  });

  await prisma.knowledgeGap.create({
    data: {
      title: 'Legacy Batch Settlement Edge Cases & Reconciliation Script',
      description: 'Reconciliation script `reconcile_v1.py` contains undocumented heuristics for dealing with partial refunds and currency conversion rounding errors.',
      category: 'Edge Cases',
      impact: 'HIGH',
      status: 'OPEN',
      suggestedAction: 'Have Rahul document the rounding threshold and unmapped merchant category codes.',
      suggestedQuestionsJson: JSON.stringify([
        'What undocumented edge cases occur during month-end batch settlement?',
        'What mistakes should a replacement avoid when modifying the reconciliation script?',
      ]),
      projectId: paymentProject.id,
      employeeId: rahul.id,
    },
  });

  // 9. Coverage Scores
  const categories = [
    { cat: 'Architecture', score: 90.0, exp: 10, cap: 9, expl: 'Extensive architectural diagrams and service interface definitions exist.' },
    { cat: 'Deployment', score: 70.0, exp: 10, cap: 7, expl: 'Good CI/CD automation guides exist, but rollback instructions are sparse.' },
    { cat: 'Troubleshooting', score: 50.0, exp: 12, cap: 6, expl: 'Only common timeout issues documented; catastrophic gateway failover undocumented.' },
    { cat: 'Business Rules', score: 40.0, exp: 10, cap: 4, expl: 'Critical billing restrictions documented, but partner fee exemption rules missing.' },
    { cat: 'Edge Cases', score: 20.0, exp: 10, cap: 2, expl: 'CRITICAL RISK: Mobile idempotency documented, but refund collisions and race conditions undocumented.' },
    { cat: 'Dependencies', score: 45.0, exp: 8, cap: 3, expl: 'Third-party Chase tier-3 contacts and undocumented Redis cluster dependencies.' },
    { cat: 'Operational Tips', score: 65.0, exp: 10, cap: 6, expl: 'Helpful tips regarding queue depths and timeout limits recorded.' },
    { cat: 'Known Problems', score: 55.0, exp: 8, cap: 4, expl: 'PgBouncer connection pool issue tracked, but sporadic memory leaks unaddressed.' },
  ];

  for (const c of categories) {
    await prisma.coverageScore.create({
      data: {
        category: c.cat,
        score: c.score,
        totalExpected: c.exp,
        totalCaptured: c.cap,
        explanation: c.expl,
        projectId: paymentProject.id,
        employeeId: rahul.id,
      },
    });
  }

  // 10. Knowledge Relationships (Knowledge Graph!)
  await prisma.knowledgeRelationship.createMany({
    data: [
      {
        sourceEntityId: rahul.id,
        sourceEntityType: 'EMPLOYEE',
        sourceLabel: 'Rahul Sharma',
        targetEntityId: paymentProject.id,
        targetEntityType: 'PROJECT',
        targetLabel: 'Payment System',
        relationshipType: 'OWNS',
        weight: 1.0,
        description: 'Principal architect and core contributor for 4 years',
      },
      {
        sourceEntityId: rahul.id,
        sourceEntityType: 'EMPLOYEE',
        sourceLabel: 'Rahul Sharma',
        targetEntityId: java.id,
        targetEntityType: 'TECHNOLOGY',
        targetLabel: 'Java',
        relationshipType: 'USES',
        weight: 0.9,
      },
      {
        sourceEntityId: rahul.id,
        sourceEntityType: 'EMPLOYEE',
        sourceLabel: 'Rahul Sharma',
        targetEntityId: spring.id,
        targetEntityType: 'TECHNOLOGY',
        targetLabel: 'Spring Boot',
        relationshipType: 'USES',
        weight: 0.95,
      },
      {
        sourceEntityId: paymentProject.id,
        sourceEntityType: 'PROJECT',
        sourceLabel: 'Payment System',
        targetEntityId: item1.id,
        targetEntityType: 'KNOWLEDGE',
        targetLabel: 'Payment API Timeout in Peak Billing',
        relationshipType: 'DOCUMENTS',
        weight: 0.9,
      },
      {
        sourceEntityId: paymentProject.id,
        sourceEntityType: 'PROJECT',
        sourceLabel: 'Payment System',
        targetEntityId: item2.id,
        targetEntityType: 'KNOWLEDGE',
        targetLabel: 'Strict Billing-Hour Restriction',
        relationshipType: 'DOCUMENTS',
        weight: 0.95,
      },
      {
        sourceEntityId: item1.id,
        sourceEntityType: 'KNOWLEDGE',
        sourceLabel: 'Payment API Timeout in Peak Billing',
        targetEntityId: item4.id,
        targetEntityType: 'KNOWLEDGE',
        targetLabel: 'PgBouncer Pool Exhaustion',
        relationshipType: 'ENCOUNTERS',
        weight: 0.75,
        description: 'Timeouts cause retry floods that exacerbate database socket starvation',
      },
      {
        sourceEntityId: item2.id,
        sourceEntityType: 'KNOWLEDGE',
        sourceLabel: 'Strict Billing-Hour Restriction',
        targetEntityId: item3.id,
        targetEntityType: 'KNOWLEDGE',
        targetLabel: 'Restart Service Immediately',
        relationshipType: 'CONFLICTS_WITH',
        weight: 1.0,
        description: 'Direct operational contradiction between CI/CD script and business safety rule',
      },
      {
        sourceEntityId: item5.id,
        sourceEntityType: 'KNOWLEDGE',
        sourceLabel: 'Zero-Downtime Deployment Checklist',
        targetEntityId: sourceRunbook.id,
        targetEntityType: 'DOCUMENTATION',
        targetLabel: 'Payment Service Deployment Guide v3.4',
        relationshipType: 'DOCUMENTS',
        weight: 0.9,
      },
      {
        sourceEntityId: arjun.id,
        sourceEntityType: 'EMPLOYEE',
        sourceLabel: 'Arjun Verma',
        targetEntityId: paymentProject.id,
        targetEntityType: 'PROJECT',
        targetLabel: 'Payment System',
        relationshipType: 'DEPLOYS',
        weight: 0.85,
      },
      {
        sourceEntityId: priya.id,
        sourceEntityType: 'EMPLOYEE',
        sourceLabel: 'Priya Mehta',
        targetEntityId: portalProject.id,
        targetEntityType: 'PROJECT',
        targetLabel: 'Customer Portal',
        relationshipType: 'OWNS',
        weight: 0.9,
      },
      {
        sourceEntityId: priya.id,
        sourceEntityType: 'EMPLOYEE',
        sourceLabel: 'Priya Mehta',
        targetEntityId: item7.id,
        targetEntityType: 'KNOWLEDGE',
        targetLabel: 'Next.js 15 Client Hydration Mismatch',
        relationshipType: 'SOLVES',
        weight: 0.85,
      },
    ],
  });

  // 11. Initial Exit Session for Rahul
  const session = await prisma.exitSession.create({
    data: {
      employeeId: rahul.id,
      status: 'ACTIVE',
      initialCoverage: 54.0,
      initialGaps: 5,
      itemsRecovered: 0,
      summary: 'Exit interview initialized for Senior Backend Developer Rahul Sharma. Primary focus: Production failure handling, payment gateway failover, and undocumented settlement scripts.',
      transcriptJson: JSON.stringify([]),
    },
  });

  await prisma.exitQuestion.create({
    data: {
      sessionId: session.id,
      question: 'I found strong documentation around architecture and deployment checklists, but very little about production troubleshooting. What usually breaks during high-volume billing deployment?',
      category: 'Troubleshooting',
      rationale: 'Troubleshooting coverage is currently only 50% for Payment System. Rahul is the sole developer who responded to the March 12 outage.',
      priority: 'CRITICAL',
      order: 1,
    },
  });

  await prisma.exitQuestion.create({
    data: {
      sessionId: session.id,
      question: 'When the Chase Paymentech 3D-Secure gateway times out or hangs, what is the exact failover protocol and which manual command triggers fallback to our secondary processor?',
      category: 'Dependencies',
      rationale: 'No documented instructions exist in any wiki or code comments for activating the secondary Adyen backup pipeline.',
      priority: 'HIGH',
      order: 2,
    },
  });

  await prisma.exitQuestion.create({
    data: {
      sessionId: session.id,
      question: 'Are there any undocumented behaviors or race conditions in the legacy reconciliation script `reconcile_v1.py` that new engineers should be warned about before modifying it?',
      category: 'Edge Cases',
      rationale: 'Edge cases coverage is at 20% (Critical Risk). This Python script runs automatically every night.',
      priority: 'HIGH',
      order: 3,
    },
  });

  // 12. Recent Activities
  await prisma.activity.createMany({
    data: [
      {
        type: 'RISK_ALERT',
        title: 'Single Point of Knowledge Failure Detected',
        description: 'Rahul Sharma holds 73% of unique operational knowledge for the Payment System and is marked as departing.',
        employeeId: rahul.id,
        projectId: paymentProject.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        type: 'CONFLICT_DETECTED',
        title: 'Operational Conflict Flagged by AI',
        description: 'Conflict detected between "Strict Billing-Hour Restriction" and "Restart Service Immediately After Deployment".',
        projectId: paymentProject.id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        type: 'GAP_DETECTED',
        title: 'Critical Knowledge Gap Identified',
        description: 'Production Failure Recovery & Payment Failover Handling has 0 verified runbooks.',
        projectId: paymentProject.id,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        type: 'SOURCE_PROCESSED',
        title: 'Processed: Core Infrastructure SRE Slack Export',
        description: 'Extracted 6 verified knowledge items and 2 database troubleshooting procedures.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        type: 'VERIFICATION',
        title: 'Knowledge Item Verified',
        description: 'Rahul Sharma verified "Payment API Timeout in Peak Billing Windows" (Confidence: 91%).',
        employeeId: rahul.id,
        projectId: paymentProject.id,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    ],
  });

  // 13. Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'HIGH_RISK_CONCENTRATION',
        title: 'Knowledge Concentration Warning',
        message: 'Rahul Sharma holds 73% of Payment System operational knowledge. Exit Mode recommended.',
        link: `/exit-mode/${rahul.id}`,
        severity: 'CRITICAL',
      },
      {
        type: 'CONFLICT',
        title: 'Knowledge Conflict Detected',
        message: 'Payment deployment instructions contain contradictory guidance regarding service restarts.',
        link: '/knowledge',
        severity: 'WARNING',
      },
      {
        type: 'CRITICAL_GAP',
        title: 'Critical Knowledge Gap',
        message: 'Payment failure handling is missing documentation. 3 targeted questions generated.',
        link: '/gaps',
        severity: 'CRITICAL',
      },
      {
        type: 'DOCUMENT_PROCESSED',
        title: 'Source Processed Successfully',
        message: 'Payment Service Architecture & Deployment Guide v3.4 indexed with 8 items extracted.',
        link: `/sources/${sourceRunbook.id}`,
        severity: 'SUCCESS',
      },
    ],
  });

  console.log('Database successfully seeded with realistic NovaTech enterprise dataset!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
