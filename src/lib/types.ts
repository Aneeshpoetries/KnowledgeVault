export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'NEW_EMPLOYEE';

export type KnowledgeType =
  | 'OPERATIONAL_TIP'
  | 'DECISION'
  | 'PROCESS'
  | 'TROUBLESHOOTING'
  | 'BUSINESS_RULE'
  | 'ARCHITECTURE'
  | 'EDGE_CASE'
  | 'KNOWN_BUG'
  | 'SOLUTION'
  | 'WARNING'
  | 'BEST_PRACTICE'
  | 'DEPENDENCY';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FreshnessStatus = 'FRESH' | 'AGING' | 'STALE' | 'UNVERIFIED';

export type SourceType =
  | 'DOCUMENT'
  | 'MEETING'
  | 'SLACK'
  | 'EMAIL'
  | 'GIT'
  | 'TICKET'
  | 'MANUAL'
  | 'EXIT_INTERVIEW';

export type EntityType =
  | 'EMPLOYEE'
  | 'PROJECT'
  | 'TECHNOLOGY'
  | 'PROCESS'
  | 'PROBLEM'
  | 'SOLUTION'
  | 'DOCUMENTATION'
  | 'KNOWLEDGE'
  | 'DECISION'
  | 'SYSTEM'
  | 'VENDOR';

export type RelationshipType =
  | 'OWNS'
  | 'WORKS_ON'
  | 'USES'
  | 'DEPLOYS'
  | 'ENCOUNTERS'
  | 'SOLVES'
  | 'DOCUMENTS'
  | 'DEPENDS_ON'
  | 'CONFLICTS_WITH'
  | 'MITIGATES';

export interface ExtractedKnowledgeItemDTO {
  title: string;
  summary: string;
  content: string;
  type: KnowledgeType;
  project?: string;
  role?: string;
  technologies: string[];
  risk: RiskLevel;
  importance: number;
  confidence: number;
  source?: string;
  sourceExcerpt?: string;
  reasoning: string;
  relatedEntities: string[];
  dependencies: string[];
  problems: string[];
  solutions: string[];
}

export interface ChatMessageCitation {
  id: string;
  title: string;
  type: KnowledgeType;
  sourceName?: string;
  sourceType?: string;
  excerpt: string;
  confidence: number;
  risk: RiskLevel;
  projectId?: string;
  projectName?: string;
}

export interface ChatAnswerResponse {
  answer: string;
  recommendedAction?: string;
  why: string;
  relevantContext: string;
  confidence: number;
  isSufficientEvidence: boolean;
  knowledgeGapDetected?: boolean;
  gapDetails?: {
    title: string;
    description: string;
    category: string;
  };
  citations: ChatMessageCitation[];
  relatedKnowledge: {
    id: string;
    title: string;
    type: KnowledgeType;
  }[];
}

export interface GraphNodeData {
  id: string;
  label: string;
  type: EntityType;
  subtitle?: string;
  risk?: RiskLevel;
  confidence?: number;
  coverage?: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  type: RelationshipType;
  weight?: number;
  description?: string;
}
