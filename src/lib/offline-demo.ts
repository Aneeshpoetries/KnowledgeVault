// Visual demo data shown only when a development session cannot reach its database.
export const offlineEmployees = [
  { id: 'demo-rahul', name: 'Rahul Sharma', role: 'Staff Infrastructure Engineer', knowledgeCoverage: 54, concentrationRatio: 73, riskLevel: 'CRITICAL', projectAssignments: [{ project: { name: 'Payment System' } }] },
  { id: 'demo-elena', name: 'Elena Rostova', role: 'Platform Engineer', knowledgeCoverage: 62, concentrationRatio: 58, riskLevel: 'HIGH', projectAssignments: [{ project: { name: 'Analytics Platform' } }] },
  { id: 'demo-arjun', name: 'Arjun Verma', role: 'Frontend Engineer', knowledgeCoverage: 76, concentrationRatio: 45, riskLevel: 'MEDIUM', projectAssignments: [{ project: { name: 'Customer Portal' } }] },
];

export const offlineGraph = {
  nodes: [
    { id: 'demo-rahul', label: 'Rahul Sharma', type: 'EMPLOYEE', risk: 'CRITICAL', subtitle: 'Staff Infrastructure Engineer', concentrationRatio: 73 },
    { id: 'demo-payment', label: 'Payment System', type: 'PROJECT', risk: 'CRITICAL', coverage: 54, subtitle: 'Core Banking API' },
    { id: 'demo-spring', label: 'Java / Spring Boot', type: 'TECHNOLOGY', subtitle: 'Payment service stack' },
    { id: 'demo-deploy', label: 'Payment Deployment', type: 'DOCUMENTATION', subtitle: 'Deployment runbook' },
    { id: 'demo-timeout', label: 'Timeout Issue', type: 'PROBLEM', risk: 'HIGH', subtitle: 'Peak billing failures' },
    { id: 'demo-solution', label: 'Redis & Envoy Check', type: 'SOLUTION', subtitle: 'Verified recovery step' },
    { id: 'demo-knowledge', label: 'Failover Knowledge', type: 'KNOWLEDGE', subtitle: 'Tacit operational context' },
  ],
  edges: [
    { id: 'demo-e1', source: 'demo-rahul', target: 'demo-payment', type: 'OWNS' },
    { id: 'demo-e2', source: 'demo-payment', target: 'demo-spring', type: 'USES' },
    { id: 'demo-e3', source: 'demo-payment', target: 'demo-deploy', type: 'DOCUMENTS' },
    { id: 'demo-e4', source: 'demo-deploy', target: 'demo-timeout', type: 'ENCOUNTERS' },
    { id: 'demo-e5', source: 'demo-timeout', target: 'demo-solution', type: 'SOLVES' },
    { id: 'demo-e6', source: 'demo-rahul', target: 'demo-knowledge', type: 'OWNS' },
  ],
};

export const offlineGaps = [
  { id: 'demo-gap-1', title: 'Payment Failure Recovery & Failover Handling', category: 'Troubleshooting', impact: 'CRITICAL', description: 'The primary-to-backup gateway switchover procedure is held by one engineer.', suggestedQuestionsJson: JSON.stringify(['Which checks come before the Adyen backup switchover?']) },
  { id: 'demo-gap-2', title: 'Peak Billing Timeout Edge Cases', category: 'Edge Cases', impact: 'HIGH', description: 'Envoy and payment provider timeout behavior is missing from the runbook.', suggestedQuestionsJson: JSON.stringify(['What should the team check before restarting during peak billing?']) },
  { id: 'demo-gap-3', title: 'Midnight Settlement Pool Sizing', category: 'Deployment', impact: 'HIGH', description: 'PgBouncer connection limits are not documented for the batch settlement job.', suggestedQuestionsJson: JSON.stringify(['Which pool setting prevents midnight settlement stalls?']) },
];

export const offlineKnowledge = [
  {
    id: 'demo-peak-billing', title: 'Peak Billing Timeout & Redis Check', type: 'TROUBLESHOOTING', risk: 'HIGH', confidence: 0.92, freshness: 'FRESH',
    summary: 'Check provider timeouts and queue depth before restarting payment service during peak billing.',
    content: 'During 10am–2pm EST, Chase Paymentech 3DS challenges can take 8,500ms while Envoy cuts off at 5,000ms. The charge can succeed downstream even after the client connection closes. Check payment provider logs and confirm Redis queue depth is below 500 before any restart. Avoid a restart during peak billing to prevent duplicate charges.',
    problemsJson: JSON.stringify(['Client timeout while a payment succeeds downstream', 'Duplicate charge risk during peak billing']),
    solutionsJson: JSON.stringify(['Compare Envoy timeout with the provider challenge duration', 'Verify Redis queue depth is below 500 before restarting']),
    dependenciesJson: JSON.stringify(['Chase Paymentech 3DS', 'Envoy', 'Redis']),
    whyItMatters: 'A routine restart can turn an incomplete client response into duplicate billing.',
    source: { name: 'Rahul exit interview', type: 'INTERVIEW' }, employee: { id: 'demo-rahul', name: 'Rahul Sharma' }, project: { id: 'demo-payment', name: 'Payment System' },
    originalSourceText: 'Never restart payment service during billing hours, and always verify Redis queue depth is below 500.', verifiedBy: 'Rahul Sharma', lastVerifiedAt: '2026-10-07T00:00:00.000Z',
  },
  {
    id: 'demo-failover', title: 'Backup Gateway Switchover', type: 'PROCESS', risk: 'CRITICAL', confidence: 0.9, freshness: 'FRESH',
    summary: 'A verified sequence for routing payment traffic to the backup gateway.',
    content: 'Confirm primary gateway health and isolate the failing route. Compare live authorization attempts with ledger writes to avoid replaying successful charges. Switch to the Adyen backup only after the queue has drained, then monitor authorization rate, idempotency keys, and settlement reconciliation.',
    problemsJson: JSON.stringify(['Primary gateway outage', 'Payment replay during failover']),
    solutionsJson: JSON.stringify(['Confirm ledger state before rerouting', 'Monitor idempotency and settlement after the switch']),
    dependenciesJson: JSON.stringify(['Adyen', 'Payment ledger', 'Redis']),
    whyItMatters: 'This procedure was previously concentrated in one engineer.',
    source: { name: 'Rahul exit interview', type: 'INTERVIEW' }, employee: { id: 'demo-rahul', name: 'Rahul Sharma' }, project: { id: 'demo-payment', name: 'Payment System' },
    originalSourceText: 'Check authorization attempts against ledger writes before switching to the backup gateway.', verifiedBy: 'Rahul Sharma', lastVerifiedAt: '2026-10-07T00:00:00.000Z',
  },
  {
    id: 'demo-settlement', title: 'Midnight Settlement Pool Sizing', type: 'EDGE_CASE', risk: 'HIGH', confidence: 0.88, freshness: 'FRESH',
    summary: 'Connection pool guidance for the midnight settlement batch.',
    content: 'Before midnight settlement, confirm PgBouncer has capacity for the batch workers and reserve connections for online payments. If the pool saturates, pause batch concurrency and inspect wait time before increasing the limit. Recheck connections after the settlement window closes.',
    problemsJson: JSON.stringify(['Batch settlement stalls at midnight', 'Online payments starved of database connections']),
    solutionsJson: JSON.stringify(['Reserve online payment connections', 'Reduce batch concurrency when pool wait rises']),
    dependenciesJson: JSON.stringify(['PostgreSQL', 'PgBouncer', 'Settlement batch']),
    whyItMatters: 'The runbook did not capture the sizing checks used during off hours.',
    source: { name: 'Rahul exit interview', type: 'INTERVIEW' }, employee: { id: 'demo-rahul', name: 'Rahul Sharma' }, project: { id: 'demo-payment', name: 'Payment System' },
    originalSourceText: 'Reserve enough connections for online traffic when midnight settlement begins.', verifiedBy: 'Rahul Sharma', lastVerifiedAt: '2026-10-07T00:00:00.000Z',
  },
];

export const offlineProjects = [
  { id: 'demo-payment', name: 'Payment System', department: 'Core Infrastructure', coverageScore: 54, riskLevel: 'CRITICAL', description: 'Tier-one payment orchestration, gateway failover, and settlement services.', technologies: [{ technology: { id: 'spring', name: 'Spring Boot' } }, { technology: { id: 'redis', name: 'Redis' } }, { technology: { id: 'postgres', name: 'PostgreSQL' } }] },
  { id: 'demo-analytics', name: 'Analytics Platform', department: 'Data Engineering', coverageScore: 62, riskLevel: 'HIGH', description: 'Event ingestion, dead-letter recovery, and operational reporting pipelines.', technologies: [{ technology: { id: 'kafka', name: 'Kafka' } }, { technology: { id: 'python', name: 'Python' } }] },
  { id: 'demo-portal', name: 'Customer Portal', department: 'Product Engineering', coverageScore: 76, riskLevel: 'MEDIUM', description: 'Customer identity, subscriptions, and self-service account workflows.', technologies: [{ technology: { id: 'react', name: 'React' } }, { technology: { id: 'next', name: 'Next.js' } }] },
];

export const offlineCoverage = {
  overallCoverage: 74,
  totalCapturedItems: offlineKnowledge.length,
  criticalGapsCount: offlineGaps.length,
  categories: [
    { category: 'Architecture', score: 82, capturedItemsCount: 7, expectedItemsCount: 9, status: 'STRONG' },
    { category: 'Deployment', score: 71, capturedItemsCount: 5, expectedItemsCount: 7, status: 'ADEQUATE' },
    { category: 'Troubleshooting', score: 54, capturedItemsCount: 6, expectedItemsCount: 11, status: 'AT_RISK' },
    { category: 'Edge Cases', score: 43, capturedItemsCount: 3, expectedItemsCount: 7, status: 'CRITICAL_GAP' },
  ],
};

export const offlineSources = [
  { id: 'demo-source-interview', name: 'Rahul Sharma Exit Interview', fileName: 'Session 04 · Payment Operations', type: 'INTERVIEW', createdAt: '2026-10-07T09:00:00.000Z', knowledgeItems: offlineKnowledge.slice(0, 2) },
  { id: 'demo-source-incident', name: 'Payment Failover Incident Review', fileName: 'INC-2481 retrospective.md', type: 'DOCUMENT', createdAt: '2026-10-05T13:30:00.000Z', knowledgeItems: offlineKnowledge.slice(1, 2) },
  { id: 'demo-source-runbook', name: 'Settlement Operations Runbook', fileName: 'settlement-operations.md', type: 'DOCUMENT', createdAt: '2026-10-03T08:15:00.000Z', knowledgeItems: offlineKnowledge.slice(2) },
];
