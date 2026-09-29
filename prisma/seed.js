const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = 'kv_salt_2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

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
  console.log('Seeding KnowledgeVault AI enterprise database with RBAC profiles...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.knowledgeReview.deleteMany();
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

  const defaultPasswordHash = hashPassword('demo123');

  // 1. Employees (with Hierarchy: Marcus -> Sarah -> Rahul, Alex)
  const marcusEmp = await prisma.employee.create({
    data: {
      name: 'Marcus Vance',
      role: 'Engineering Director',
      department: 'Engineering Leadership',
      email: 'marcus@novatech.demo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Engineering Director leading platform continuity, enterprise reliability, and architectural governance.',
      riskLevel: 'LOW',
      knowledgeCoverage: 92.0,
      criticalKnowledgeCount: 1,
      atRiskKnowledgeCount: 2,
      concentrationRatio: 15.0,
      lifecycleStatus: 'ACTIVE',
      isExitModeActive: false,
      joinedDate: new Date('2020-01-15'),
    },
  });

  const sarahEmp = await prisma.employee.create({
    data: {
      name: 'Sarah Lin',
      role: 'Engineering Manager',
      department: 'Core Infrastructure & Payments',
      email: 'sarah@novatech.demo',
      managerId: marcusEmp.id,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      bio: 'Engineering Manager leading Core Infrastructure, payments processing, and database reliability teams.',
      riskLevel: 'LOW',
      knowledgeCoverage: 84.0,
      criticalKnowledgeCount: 2,
      atRiskKnowledgeCount: 4,
      concentrationRatio: 22.0,
      lifecycleStatus: 'ACTIVE',
      isExitModeActive: false,
      joinedDate: new Date('2021-04-10'),
    },
  });

  const rahulEmp = await prisma.employee.create({
    data: {
      name: 'Rahul Sharma',
      role: 'Staff Infrastructure Engineer',
      department: 'Core Infrastructure & Payments',
      email: 'rahul@novatech.demo',
      managerId: sarahEmp.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Lead architect of NovaTech payment engine for 4 years. Single point of contact for legacy settlement workflows. Departing in 2 weeks.',
      riskLevel: 'CRITICAL',
      knowledgeCoverage: 54.0,
      criticalKnowledgeCount: 8,
      atRiskKnowledgeCount: 14,
      concentrationRatio: 73.0,
      lifecycleStatus: 'EXIT_PENDING',
      isExitModeActive: true,
      joinedDate: new Date('2022-03-15'),
    },
  });

  const alexEmp = await prisma.employee.create({
    data: {
      name: 'Alex Chen',
      role: 'Junior Developer',
      department: 'Core Infrastructure & Payments',
      email: 'alex@novatech.demo',
      managerId: sarahEmp.id,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      bio: 'Junior Developer ramping up on NovaTech services, reviewing runbooks, and exploring core payment architecture.',
      riskLevel: 'LOW',
      knowledgeCoverage: 28.0,
      criticalKnowledgeCount: 0,
      atRiskKnowledgeCount: 1,
      concentrationRatio: 5.0,
      lifecycleStatus: 'ACTIVE',
      isExitModeActive: false,
      joinedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Joined 3 days ago
    },
  });

  const priyaEmp = await prisma.employee.create({
    data: {
      name: 'Priya Mehta',
      role: 'Staff Frontend Engineer',
      department: 'Design Systems & Portal',
      email: 'priya.mehta@novatech.demo',
      managerId: marcusEmp.id,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      bio: 'Creator of NovaTech Unified UI kit, SSR hydration optimization lead.',
      riskLevel: 'MEDIUM',
      knowledgeCoverage: 78.0,
      criticalKnowledgeCount: 3,
      atRiskKnowledgeCount: 5,
      concentrationRatio: 42.0,
      lifecycleStatus: 'ACTIVE',
      joinedDate: new Date('2022-08-01'),
    },
  });

  const arjunEmp = await prisma.employee.create({
    data: {
      name: 'Arjun Verma',
      role: 'Principal DevOps & SRE Engineer',
      department: 'Cloud Platform & Reliability',
      email: 'arjun.verma@novatech.demo',
      managerId: marcusEmp.id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Maintains AWS multi-region Kubernetes clusters, Kafka pipeline, and zero-trust IAM networks.',
      riskLevel: 'HIGH',
      knowledgeCoverage: 68.0,
      criticalKnowledgeCount: 6,
      atRiskKnowledgeCount: 11,
      concentrationRatio: 65.0,
      lifecycleStatus: 'ACTIVE',
      joinedDate: new Date('2021-11-10'),
    },
  });

  // 2. Demo Users (Authentication accounts with passwordHash)
  await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@novatech.demo',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      title: 'Engineering Director',
      avatar: marcusEmp.avatar,
      employeeId: marcusEmp.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Sarah Lin',
      email: 'sarah@novatech.demo',
      passwordHash: defaultPasswordHash,
      role: 'MANAGER',
      title: 'Engineering Manager',
      avatar: sarahEmp.avatar,
      employeeId: sarahEmp.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@novatech.demo',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      title: 'Staff Infrastructure Engineer',
      avatar: rahulEmp.avatar,
      employeeId: rahulEmp.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex@novatech.demo',
      passwordHash: defaultPasswordHash,
      role: 'NEW_EMPLOYEE',
      title: 'Junior Developer',
      avatar: alexEmp.avatar,
      employeeId: alexEmp.id,
    },
  });

  // 3. Projects
  const paymentProject = await prisma.project.create({
    data: {
      name: 'Payment System',
      slug: 'payment-system',
      description: 'Core transactional backbone handling card charges, ACH transfers, idempotency tokens, and ledger settlements.',
      department: 'Core Infrastructure & Payments',
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
      department: 'Design Systems & Portal',
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
      department: 'Core Infrastructure & Payments',
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
      { employeeId: marcusEmp.id, projectId: paymentProject.id, role: 'Executive Sponsor' },
      { employeeId: marcusEmp.id, projectId: portalProject.id, role: 'Executive Sponsor' },
      { employeeId: marcusEmp.id, projectId: analyticsProject.id, role: 'Executive Sponsor' },
      { employeeId: sarahEmp.id, projectId: paymentProject.id, role: 'Engineering Manager' },
      { employeeId: sarahEmp.id, projectId: analyticsProject.id, role: 'Engineering Manager' },
      { employeeId: rahulEmp.id, projectId: paymentProject.id, role: 'Lead Architect' },
      { employeeId: rahulEmp.id, projectId: analyticsProject.id, role: 'Integration Specialist' },
      { employeeId: alexEmp.id, projectId: paymentProject.id, role: 'Onboarding Contributor' },
      { employeeId: arjunEmp.id, projectId: paymentProject.id, role: 'Infrastructure Lead' },
      { employeeId: priyaEmp.id, projectId: portalProject.id, role: 'Frontend Lead' },
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
      { employeeId: rahulEmp.id, technologyId: java.id, proficiency: 'EXPERT' },
      { employeeId: rahulEmp.id, technologyId: spring.id, proficiency: 'EXPERT' },
      { employeeId: rahulEmp.id, technologyId: redis.id, proficiency: 'EXPERT' },
      { employeeId: rahulEmp.id, technologyId: postgres.id, proficiency: 'EXPERT' },
      { employeeId: sarahEmp.id, technologyId: java.id, proficiency: 'EXPERT' },
      { employeeId: sarahEmp.id, technologyId: postgres.id, proficiency: 'EXPERT' },
      { employeeId: alexEmp.id, technologyId: java.id, proficiency: 'INTERMEDIATE' },
      { employeeId: alexEmp.id, technologyId: spring.id, proficiency: 'NOVICE' },
      { employeeId: priyaEmp.id, technologyId: react.id, proficiency: 'EXPERT' },
      { employeeId: priyaEmp.id, technologyId: nextjs.id, proficiency: 'EXPERT' },
      { employeeId: arjunEmp.id, technologyId: docker.id, proficiency: 'EXPERT' },
      { employeeId: arjunEmp.id, technologyId: aws.id, proficiency: 'EXPERT' },
    ],
  });

  // 5. Sources
  const sourceMeeting = await prisma.knowledgeSource.create({
    data: {
      title: 'Payment Deployment Incident Review – March 12',
      type: 'MEETING',
      fileName: 'payment-incident-march12-transcript.txt',
      fileSize: 14200,
      mimeType: 'text/plain',
      rawText: 'Discussion regarding the outage during the payment gateway rollout. API gateway timeout was set to 5000ms while Chase 3DS takes up to 8500ms.',
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
      rawText: '# Payment Service Runbook\nDeployment requires verifying Redis cluster replica lag and setting PgBouncer pool max connections to 80.',
      status: 'PROCESSED',
      confidence: 0.91,
      extractedCount: 8,
      highRiskCount: 2,
      processedAt: new Date(),
    },
  });

  // 6. Knowledge Items with Visibility and Statuses
  const item1 = await prisma.knowledgeItem.create({
    data: {
      title: 'Payment API Timeout in Peak Billing Windows',
      summary: 'Before modifying payment API or deploying new revisions, verify and increase API gateway timeout to at least 10,000ms to avoid silent 504 Gateway Timeouts under Chase 3DS traffic.',
      content: 'During peak billing hours (10:00 - 14:00 EST on month-end), third-party payment partner gateways experience 3D-Secure 2.0 biometric challenge delays that exceed 7,500ms. If the internal Envoy/Kong proxy timeout is left at default 5,000ms, client connections are severed while backend card auth actually succeeds, resulting in phantom double-charges. Always verify Redis queue depth is below 500 before triggering rolling redeploys.',
      originalSourceText: 'Whenever we update the payment API, check the timeout setting because it caused serious problems last time. Chase Paymentech 3DS v2 takes up to 8500ms during peak volume, while default gateway cut off at 5000ms.',
      aiInterpretation: 'The payment service is acutely susceptible to downstream latency variance in third-party card processing.',
      whyItMatters: 'Direct financial liability and chargeback risk.',
      type: 'OPERATIONAL_TIP',
      risk: 'HIGH',
      importance: 9,
      confidence: 0.91,
      status: 'APPROVED',
      visibility: 'PROJECT',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Rahul Sharma',
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
      createdByEmployeeId: rahulEmp.id,
      reviewedByEmployeeId: sarahEmp.id,
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      sourceId: sourceMeeting.id,
      tagsJson: JSON.stringify(['payment', 'timeout', 'gateway', 'envoy', 'chase-paymentech', '3ds']),
      problemsJson: JSON.stringify(['504 Gateway Timeout during peak billing windows', 'Phantom charges']),
      solutionsJson: JSON.stringify(['Increase API gateway timeout to 10,000ms']),
      dependenciesJson: JSON.stringify(['Envoy API Gateway', 'Chase Paymentech 3DS v2', 'Redis session cluster']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma', 'Java', 'Spring Boot']),
    },
  });

  const item2 = await prisma.knowledgeItem.create({
    data: {
      title: 'Strict Billing-Hour Execution Restriction',
      summary: 'Never trigger payment service restart or execute settlement batch scripts between 09:00 - 18:00 EST. High-volume card authorization drops inflight requests during pod termination.',
      content: 'The payment service maintains active HTTP connections with bank processors for authorization holds. While Kubernetes sends SIGTERM, the third-party client library does not gracefully flush socket pools. Any deployment during peak hours (09:00 - 18:00 EST) results in dropped customer checkouts with uncommitted ledger states. Schedule rolling upgrades strictly between 02:00 - 05:00 EST.',
      originalSourceText: 'Do not restart billing during business hours under any circumstances. We dropped 40 transactions last November.',
      aiInterpretation: 'The service lacks connection-draining support for long-lived partner sockets.',
      whyItMatters: 'Violates SLA agreements and triggers merchant penalties.',
      type: 'BUSINESS_RULE',
      risk: 'CRITICAL',
      importance: 10,
      confidence: 0.96,
      status: 'APPROVED',
      visibility: 'PROJECT',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Rahul Sharma',
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
      createdByEmployeeId: rahulEmp.id,
      reviewedByEmployeeId: sarahEmp.id,
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      sourceId: sourceMeeting.id,
      tagsJson: JSON.stringify(['payment', 'deployment', 'restriction', 'sla', 'production']),
      problemsJson: JSON.stringify(['Dropped customer checkouts', 'Uncommitted ledger states']),
      solutionsJson: JSON.stringify(['Deploy only between 02:00 - 05:00 EST']),
      dependenciesJson: JSON.stringify(['Kubernetes Ingress', 'Payment Service Pods']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma']),
    },
  });

  const item3 = await prisma.knowledgeItem.create({
    data: {
      title: 'PgBouncer Connection Starvation Under Sub-Job Fanout',
      summary: 'When batch settlement cron runs at midnight, set worker batch size to 25 to prevent PgBouncer connection pool exhaustion across the cluster.',
      content: 'The midnight settlement engine in `settlement-worker.jar` defaults to 4 parallel worker threads. Each thread acquires 30 connections to PostgreSQL through PgBouncer. Under high volume, this claims 120 client connections, exceeding the default pool ceiling of 100. This starvates incoming web checkout queries, causing sudden 500 errors. Override JVM flag: `-Dworker.batch.size=25` to cap pool usage at 60 connections.',
      originalSourceText: 'Thread: PgBouncer connection exhaustion during midnight settlement cron. Rahul: "The worker batch size defaults to 50 in application.yml, but the settlement engine spawns 4 parallel sub-jobs, saturating all 120 sockets."',
      aiInterpretation: 'A concurrency mismatch exists between worker thread pools and PgBouncer maximum client quotas.',
      whyItMatters: 'Causes catastrophic midnight outages affecting worldwide user payments.',
      type: 'TROUBLESHOOTING',
      risk: 'HIGH',
      importance: 8,
      confidence: 0.92,
      status: 'APPROVED',
      visibility: 'TEAM',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      verifiedBy: 'Rahul Sharma',
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
      createdByEmployeeId: rahulEmp.id,
      reviewedByEmployeeId: sarahEmp.id,
      reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      sourceId: sourceMeeting.id,
      tagsJson: JSON.stringify(['postgres', 'pgbouncer', 'settlement', 'cron', 'connection-pool']),
      problemsJson: JSON.stringify(['PgBouncer connection starvation', 'Midnight 500 errors during checkout']),
      solutionsJson: JSON.stringify(['Set worker.batch.size=25', 'Cap pool allocation to 60 connections']),
      dependenciesJson: JSON.stringify(['PgBouncer', 'PostgreSQL 16', 'Settlement Worker']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma', 'PostgreSQL']),
    },
  });

  const item4 = await prisma.knowledgeItem.create({
    data: {
      title: 'NovaTech Architecture Blueprint & Service Topology',
      summary: 'Comprehensive overview of microservices topology, API gateway routing, event streaming bus, and multi-region failover architecture.',
      content: 'NovaTech operates a hybrid event-driven architecture. Client applications connect via Cloudflare Edge to Envoy Gateway. State is persisted in Aurora PostgreSQL clusters with Redis for sub-millisecond caching and Kafka for downstream event propagation. All services are deployed in AWS us-east-1 and us-west-2.',
      originalSourceText: 'Standard architectural documentation for enterprise platform services.',
      aiInterpretation: 'Official architecture specification for all engineers.',
      whyItMatters: 'Foundational mental model for service development and operational debugging.',
      type: 'ARCHITECTURE',
      risk: 'LOW',
      importance: 8,
      confidence: 0.98,
      status: 'APPROVED',
      visibility: 'PUBLIC',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(),
      verifiedBy: 'Marcus Vance',
      projectId: paymentProject.id,
      employeeId: marcusEmp.id,
      createdByEmployeeId: marcusEmp.id,
      reviewedByEmployeeId: marcusEmp.id,
      reviewedAt: new Date(),
      sourceId: sourceRunbook.id,
      tagsJson: JSON.stringify(['architecture', 'topology', 'microservices', 'overview']),
      problemsJson: JSON.stringify([]),
      solutionsJson: JSON.stringify(['Reference for cross-service communication']),
      dependenciesJson: JSON.stringify(['Envoy', 'Kafka', 'PostgreSQL']),
      relatedEntitiesJson: JSON.stringify(['NovaTech Platform', 'Marcus Vance']),
    },
  });

  const item5 = await prisma.knowledgeItem.create({
    data: {
      title: 'Developer Onboarding & Local Environment Setup Guide',
      summary: 'Step-by-step setup guide for configuring local Docker compose stack, running mock payment webhooks, and seeding test ledger databases.',
      content: 'Welcome to NovaTech. Clone the platform repository and run `make bootstrap-dev`. This spins up local PostgreSQL, Redis, Kafka, and WireMock payment simulator containers. Use port 8080 for billing API and port 3000 for customer portal.',
      originalSourceText: 'Standard engineer onboarding manual.',
      aiInterpretation: 'Onboarding guide for new team members.',
      whyItMatters: 'Reduces time-to-first-commit from 3 weeks to 2 days for new engineers.',
      type: 'PROCESS',
      risk: 'LOW',
      importance: 7,
      confidence: 0.95,
      status: 'APPROVED',
      visibility: 'PUBLIC',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(),
      verifiedBy: 'Sarah Lin',
      projectId: paymentProject.id,
      employeeId: alexEmp.id,
      createdByEmployeeId: sarahEmp.id,
      reviewedByEmployeeId: sarahEmp.id,
      reviewedAt: new Date(),
      sourceId: sourceRunbook.id,
      tagsJson: JSON.stringify(['onboarding', 'setup', 'docker', 'developer-guide']),
      problemsJson: JSON.stringify([]),
      solutionsJson: JSON.stringify(['Standard local dev configuration']),
      dependenciesJson: JSON.stringify(['Docker', 'Make']),
      relatedEntitiesJson: JSON.stringify(['Alex Chen', 'Sarah Lin']),
    },
  });

  // PENDING REVIEW ITEMS (Submitted by Rahul, waiting for Sarah's review!)
  const pendingItem1 = await prisma.knowledgeItem.create({
    data: {
      title: 'Redis Shard Balancing Under High TPS Burst',
      summary: 'Dynamic cluster hash slot rebalancing requires manual migration pauses during Black Friday volume spikes to prevent transient key misses.',
      content: 'When cluster utilization exceeds 85%, Redis auto-resharding triggers hashslot migration. In flight read requests for user session tokens experience 100ms pauses. We must run `redis-cli --cluster rebalance --pipeline 10` before major sales events to lock slot distributions.',
      originalSourceText: 'From Rahul notes: Remember to pause resharding before holiday sales or token validation drops 3% of incoming checkouts.',
      aiInterpretation: 'Operational procedure to avoid transient cache misses during Redis cluster rebalancing.',
      whyItMatters: 'Prevents checkout drops and user logouts during peak retail windows.',
      type: 'OPERATIONAL_TIP',
      risk: 'HIGH',
      importance: 8,
      confidence: 0.93,
      status: 'PENDING_REVIEW',
      visibility: 'TEAM',
      freshness: 'UNVERIFIED',
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
      createdByEmployeeId: rahulEmp.id,
      tagsJson: JSON.stringify(['redis', 'resharding', 'cluster', 'tps-burst']),
      problemsJson: JSON.stringify(['Transient session cache misses', 'Checkout drops']),
      solutionsJson: JSON.stringify(['Run manual rebalance with pipeline 10 before volume spikes']),
      dependenciesJson: JSON.stringify(['Redis Cluster']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma']),
    },
  });

  const pendingItem2 = await prisma.knowledgeItem.create({
    data: {
      title: 'Stripe Webhook Idempotency Key Handling',
      summary: 'Stripe charge webhook events must always be verified against the local Redis idempotency hash with a 72-hour TTL to prevent double customer refunds.',
      content: 'Stripe retries failed webhook deliveries up to 12 times over 72 hours. When our database experiences transient connection timeouts, Stripe retries. If the consumer does not check Redis key `stripe:event:{id}` before calling `ledgerService.creditRefund()`, customers receive duplicate credits.',
      originalSourceText: 'We had an incident where 4 refunds were processed 3 times because the webhook consumer didn’t lock the event ID in Redis.',
      aiInterpretation: 'Critical idempotency guard in the billing webhook listener.',
      whyItMatters: 'Financial loss from duplicate refund issuance.',
      type: 'TROUBLESHOOTING',
      risk: 'CRITICAL',
      importance: 9,
      confidence: 0.96,
      status: 'PENDING_REVIEW',
      visibility: 'TEAM',
      freshness: 'UNVERIFIED',
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
      createdByEmployeeId: rahulEmp.id,
      tagsJson: JSON.stringify(['stripe', 'webhooks', 'idempotency', 'refunds']),
      problemsJson: JSON.stringify(['Duplicate customer refund issuance', 'Ledger divergence']),
      solutionsJson: JSON.stringify(['Check Redis idempotency key with 72h TTL']),
      dependenciesJson: JSON.stringify(['Stripe API', 'Redis']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma']),
    },
  });

  const pendingItem3 = await prisma.knowledgeItem.create({
    data: {
      title: 'Payment Failover Secondary Gateway Manual Trigger',
      summary: 'When primary Chase Paymentech 3DS proxy drops below 80% success rate, run the manual Kubernetes failover job to switch payment traffic to Adyen backup processor.',
      content: 'Execute: `kubectl apply -f k8s/billing-router/failover-adyen.yaml`. This commands the billing router to divert new authorizations to Adyen while draining inflight transactions. Requires confirmation on on-call Slack channel `#payments-oncall`.',
      originalSourceText: 'The manual switch to Adyen is in k8s/billing-router/failover-adyen.yaml, but only Rahul and Sarah usually know how to trigger it.',
      aiInterpretation: 'Emergency operational failover runbook for high-severity card gateway outages.',
      whyItMatters: 'Single point of failure recovery during catastrophic tier-1 vendor outages.',
      type: 'TROUBLESHOOTING',
      risk: 'CRITICAL',
      importance: 10,
      confidence: 0.95,
      status: 'PENDING_REVIEW',
      visibility: 'TEAM',
      freshness: 'UNVERIFIED',
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
      createdByEmployeeId: rahulEmp.id,
      tagsJson: JSON.stringify(['failover', 'adyen', 'chase', 'emergency-runbook']),
      problemsJson: JSON.stringify(['Complete card processing blackout', 'Vendor outage']),
      solutionsJson: JSON.stringify(['Execute failover-adyen.yaml job within 90s']),
      dependenciesJson: JSON.stringify(['Kubernetes', 'Adyen Backup API']),
      relatedEntitiesJson: JSON.stringify(['Payment System', 'Rahul Sharma', 'Sarah Lin']),
    },
  });

  // RESTRICTED ITEM (Executive Risk Audit - Visible only to Marcus Vance)
  const restrictedItem = await prisma.knowledgeItem.create({
    data: {
      title: 'Q3 Executive Risk & Single Point of Failure Concentration Audit',
      summary: 'Confidential executive briefing detailing institutional continuity vulnerability: 73% of core payment engine institutional memory resides with departing engineer Rahul Sharma.',
      content: 'This executive audit evaluates organizational knowledge retention risk. Finding: Rahul Sharma is the sole engineer capable of resolving midnight batch settlement stalls and gateway failovers. Offboarding without structured tacit knowledge capture presents an estimated $420,000/day outage liability risk. Immediate action: Initiate KnowledgeVault Exit Mode recovery sessions.',
      originalSourceText: 'Confidential HR and VP Engineering institutional risk review report.',
      aiInterpretation: 'Executive risk analysis restricted to organizational leadership.',
      whyItMatters: 'Enterprise continuity risk and valuation protection during senior talent transitions.',
      type: 'WARNING',
      risk: 'CRITICAL',
      importance: 10,
      confidence: 0.99,
      status: 'APPROVED',
      visibility: 'RESTRICTED',
      freshness: 'FRESH',
      lastVerifiedAt: new Date(),
      verifiedBy: 'Marcus Vance',
      projectId: paymentProject.id,
      employeeId: marcusEmp.id,
      createdByEmployeeId: marcusEmp.id,
      reviewedByEmployeeId: marcusEmp.id,
      reviewedAt: new Date(),
      tagsJson: JSON.stringify(['executive-audit', 'risk-concentration', 'spof', 'offboarding']),
      problemsJson: JSON.stringify(['Single point of failure concentration', 'Departure continuity vulnerability']),
      solutionsJson: JSON.stringify(['Enforce KnowledgeVault Exit Mode interviews before departure']),
      dependenciesJson: JSON.stringify(['Leadership Governance']),
      relatedEntitiesJson: JSON.stringify(['Marcus Vance', 'Rahul Sharma', 'Payment System']),
    },
  });

  // Generate embeddings for all items
  const allItems = [item1, item2, item3, item4, item5, pendingItem1, pendingItem2, pendingItem3, restrictedItem];
  for (const it of allItems) {
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

  // 7. Initial Knowledge Reviews
  await prisma.knowledgeReview.create({
    data: {
      knowledgeItemId: item1.id,
      reviewerName: 'Sarah Lin',
      reviewerRole: 'MANAGER',
      action: 'APPROVE',
      reason: 'Verified against March 12 post-mortem and gateway load-test telemetry. Clean technical documentation.',
    },
  });

  await prisma.knowledgeReview.create({
    data: {
      knowledgeItemId: item2.id,
      reviewerName: 'Sarah Lin',
      reviewerRole: 'MANAGER',
      action: 'APPROVE',
      reason: 'Essential business rule. Approved and locked for all billing releases.',
    },
  });

  // 8. Exit Mode Session for Rahul Sharma
  const session = await prisma.exitSession.create({
    data: {
      employeeId: rahulEmp.id,
      status: 'ACTIVE',
      initialCoverage: 54.0,
      initialGaps: 4,
      itemsRecovered: 0,
      summary: 'Knowledge Recovery Interview for Rahul Sharma (Staff Infrastructure Engineer). Prioritizing single-point-of-failure settlement operations and third-party failover procedures.',
    },
  });

  await prisma.exitQuestion.createMany({
    data: [
      {
        sessionId: session.id,
        question: 'I found strong documentation around architecture and deployment checklists, but very little about production troubleshooting. What usually breaks during high-volume billing deployment?',
        category: 'Troubleshooting',
        rationale: 'Troubleshooting coverage is currently in the critical zone. Single point of failure recovery.',
        priority: 'CRITICAL',
        order: 1,
      },
      {
        sessionId: session.id,
        question: 'When the Chase Paymentech 3D-Secure gateway times out or hangs, what is the exact failover protocol and which manual command triggers fallback to our secondary processor?',
        category: 'Dependencies',
        rationale: 'Vendor escalation and out-of-band clearance protocol is completely unwritten.',
        priority: 'HIGH',
        order: 2,
      },
      {
        sessionId: session.id,
        question: 'What undocumented edge cases or race conditions exist in the batch settlement script `reconcile_v1.py` that new engineers should avoid modifying without caution?',
        category: 'Edge Cases',
        rationale: 'Reconciliation script heuristics are undocumented.',
        priority: 'HIGH',
        order: 3,
      },
    ],
  });

  // 9. Knowledge Gaps
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
      ]),
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
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
      ]),
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
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
      projectId: paymentProject.id,
      employeeId: rahulEmp.id,
    },
  });

  // 10. Coverage Scores
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
        employeeId: rahulEmp.id,
      },
    });
  }

  // 11. Role-Scoped Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: sarahEmp.id,
        employeeId: sarahEmp.id,
        type: 'REVIEW_REQUEST',
        title: 'Knowledge Awaiting Review',
        message: 'Rahul Sharma submitted "Redis Shard Balancing Under High TPS Burst" for manager approval.',
        link: '/reviews',
        severity: 'INFO',
      },
      {
        userId: sarahEmp.id,
        employeeId: sarahEmp.id,
        type: 'REVIEW_REQUEST',
        title: 'Critical Knowledge Submission',
        message: 'Rahul Sharma submitted "Stripe Webhook Idempotency Key Handling" (Risk: CRITICAL).',
        link: '/reviews',
        severity: 'WARNING',
      },
      {
        userId: rahulEmp.id,
        employeeId: rahulEmp.id,
        type: 'KNOWLEDGE_APPROVED',
        title: 'Knowledge Approved',
        message: 'Sarah Lin approved your submission "Payment API Timeout in Peak Billing Windows".',
        link: `/knowledge/${item1.id}`,
        severity: 'SUCCESS',
      },
      {
        userId: alexEmp.id,
        employeeId: alexEmp.id,
        type: 'DOCUMENT_PROCESSED',
        title: 'Recommended Onboarding Runbook',
        message: 'Explore the "Developer Onboarding & Local Environment Setup Guide" to start your ramp-up.',
        link: `/knowledge/${item5.id}`,
        severity: 'INFO',
      },
      {
        userId: marcusEmp.id,
        employeeId: marcusEmp.id,
        type: 'HIGH_RISK_CONCENTRATION',
        title: 'Organization Risk Alert',
        message: 'Rahul Sharma holds 73% of Payment System operational knowledge. Offboarding recovery active.',
        link: `/exit-mode/${rahulEmp.id}`,
        severity: 'CRITICAL',
      },
    ],
  });

  // 12. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userName: 'Marcus Vance',
        userRole: 'ADMIN',
        action: 'LOGIN',
        resourceType: 'SYSTEM',
        detailsJson: JSON.stringify({ ip: '10.250.0.12', browser: 'Chrome Desktop' }),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        userName: 'Rahul Sharma',
        userRole: 'EMPLOYEE',
        action: 'KNOWLEDGE_SUBMIT',
        resourceType: 'KNOWLEDGE',
        resourceId: pendingItem1.id,
        detailsJson: JSON.stringify({ title: pendingItem1.title, status: 'PENDING_REVIEW' }),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userName: 'Sarah Lin',
        userRole: 'MANAGER',
        action: 'KNOWLEDGE_APPROVE',
        resourceType: 'KNOWLEDGE',
        resourceId: item1.id,
        detailsJson: JSON.stringify({ title: item1.title, author: 'Rahul Sharma' }),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('Database successfully seeded with enterprise RBAC hierarchy, demo users, and approval queues!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
