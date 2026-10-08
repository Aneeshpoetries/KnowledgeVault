/** Exact demo prompts resolve from the current snapshot; live workspaces use authorized retrieval. */
export const assistantPrompts = [
  {
    label: "Diagnose payment timeouts",
    query: "What should I check before restarting the payment service?",
    detail: "Recovery steps and the risk behind them",
    memoryId: "demo-peak-billing",
  },
  {
    label: "Switch to the backup gateway",
    query: "How do I safely switch to the backup payment gateway?",
    detail: "The failover sequence, with evidence",
    memoryId: "demo-failover",
  },
  {
    label: "Prepare midnight settlement",
    query:
      "How do I prevent connection pool stalls during midnight settlement?",
    detail: "Batch capacity and operational checks",
    memoryId: "demo-settlement",
  },
  {
    label: "Find knowledge gaps",
    query: "Which production procedures are undocumented?",
    detail: "What still needs to be captured",
    memoryId: null,
  },
] as const;
