# 💡 KnowledgeVault AI — Technical Overview & Project Plan

> **AI Knowledge Continuity System** | Hackathon Edition (Dev2Hack 2026)

---

## 🧩 The Problem

When experienced employees leave an organisation, their institutional knowledge typically exists in fragmented, inaccessible formats:

- **Tacit knowledge** locked in their heads (undocumented decision rationale, war stories, tribal shortcuts)
- **Semi-structured artifacts** — old Slack threads, incident post-mortems, email chains, meeting transcripts
- **Scattered structured assets** — runbooks, architecture diagrams, code comments, Confluence pages

The result is **acute organisational brain drain**: successors spend **weeks to months** reconstructing context that should already exist. The cost is compounded when the departing employee is a critical single point of knowledge failure.

---

## ✅ The Solution

**KnowledgeVault AI** is a production-grade platform that:

1. **Ingests** documents, transcripts, and source artifacts from multiple formats
2. **Structures** raw content into verified, atomic knowledge items via LLM
3. **Connects** items into an interactive, traversable Knowledge Graph
4. **Serves** contextually accurate, evidence-cited answers via a RAG AI Assistant
5. **Quantifies** knowledge coverage across 8 critical domains using a mathematical score
6. **Recovers** tacit knowledge proactively through an interactive Employee Exit Mode

The net effect: an organisation's knowledge no longer resides in one person's head — it lives in a searchable, verifiable, continuously maintained system.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KnowledgeVault AI Platform                         │
│                                                                             │
│  ┌──────────────┐    ┌─────────────────────────────────────────────────┐   │
│  │   Next.js    │    │                  AI / RAG Engine                 │   │
│  │  App Router  │◄──►│  OpenAI LLM ──► Embeddings ──► Vector Search    │   │
│  │  (Frontend + │    │  Heuristic Fallback (offline-safe)               │   │
│  │   API Layer) │    └─────────────────────────────────────────────────┘   │
│  └──────┬───────┘                          ▲                               │
│         │                                  │                               │
│         ▼                                  ▼                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Prisma ORM (Data Layer)                      │  │
│  │   SQLite (dev) ──────────────────────── PostgreSQL (production)      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  Document    │  │  Knowledge │  │  Coverage  │  │   Exit Mode        │  │
│  │  Parser      │  │  Graph     │  │  Engine    │  │   Session Engine   │  │
│  │  (PDF/DOCX/  │  │  (React    │  │  (8-Domain │  │   (Adaptive Q&A    │  │
│  │   MD/TXT/CSV)│  │   Flow)    │  │   Scorer)  │  │    + Embedding)    │  │
│  └──────────────┘  └────────────┘  └────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧰 Technology Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **Next.js 15** (App Router) | Full-stack React framework with server components & API routes |
| **React 19** | UI component rendering |
| **TypeScript** | Type safety across frontend and backend |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animated transitions and micro-interactions |
| **`@xyflow/react` (React Flow)** | Interactive Knowledge Graph visualization (drag, pan, zoom, node detail panel) |
| **`@dagrejs/dagre`** | Automatic directed-graph layout engine |
| **Recharts** | Coverage score bar charts and analytics dashboards |
| **Lucide Icons** | Consistent iconography |

### Backend / API
| Technology | Purpose |
| :--- | :--- |
| **Next.js App Router** | Server Actions and REST API endpoints under `/api/` |
| **Prisma ORM** | Type-safe database access; schema-as-code |
| **SQLite** | Zero-setup local development database (`prisma/dev.db`) |
| **PostgreSQL** | Production-grade relational database (via `DATABASE_URL`) |
| **bcryptjs** | Secure password hashing |
| **Nodemailer / Resend** | Password-reset and notification emails |

### AI & Vector Pipeline
| Technology | Purpose |
| :--- | :--- |
| **OpenAI API** | LLM for knowledge structuring, gap filling, exit-mode question generation |
| **OpenAI Embeddings** | `text-embedding-3-small` for semantic vector representation |
| **Deterministic N-gram Vectorizer** | Offline fallback: reproducible float embeddings without API calls |
| **Cosine Similarity Search** | Nearest-neighbour retrieval over `KnowledgeEmbedding` table |
| **RAG Pipeline** | Retrieval → Context Assembly → LLM Prompt → Cited Response |

### Document Processing
| Format | Library |
| :--- | :--- |
| PDF | `pdf-parse` |
| DOCX | `mammoth` |
| Markdown / TXT / CSV / JSON | Native Node.js parsing |

---

## 🔄 Core Data Flow

```
                          ┌────────────────────────────┐
                          │   Knowledge Ingestion       │
                          │  (Upload / Paste / Source)  │
                          └────────────┬───────────────┘
                                       │
                          ┌────────────▼───────────────┐
                          │   Document Parser           │
                          │  PDF · DOCX · MD · TXT · CSV│
                          └────────────┬───────────────┘
                                       │
                          ┌────────────▼───────────────┐
                          │   LLM Structuring           │
                          │  Extract: What · Why ·      │
                          │  How · Problems · Solutions │
                          └────────────┬───────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
  ┌───────────▼──────┐   ┌─────────────▼──────────┐  ┌────────▼────────────┐
  │  KnowledgeItem   │   │  KnowledgeEmbedding     │  │ KnowledgeRelationship│
  │  (Verified,      │   │  (Float vector for       │  │  (Graph edges:      │
  │   risk-tagged,   │   │   cosine similarity)     │  │   OWNS / DEPLOYS /  │
  │   confidence %)  │   └─────────────────────────┘  │   SOLVES / CONFLICTS)│
  └───────────┬──────┘                                 └────────────────────┘
              │
  ┌───────────▼──────────────────────────────────────────────────────────┐
  │                        Coverage Engine                                │
  │  Calculates 8-Domain Score: Architecture · Deployment ·              │
  │  Troubleshooting · Business Rules · Edge Cases ·                     │
  │  Integrations · Processes · Undocumented Decisions                   │
  └───────────┬──────────────────────────────────────────────────────────┘
              │
  ┌───────────▼──────────────────────────────────────────────────────────┐
  │                       RAG Assistant                                   │
  │  Query → Vector Search (top-k items) → Context assembly →            │
  │  LLM prompt with citations → Structured answer with sources          │
  └──────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Pipeline Deep Dive

### 1. Knowledge Structuring (Ingestion)
When a document is uploaded, the LLM is prompted to extract and structure:
- **What** the knowledge item is
- **Why it matters** to the organisation
- **How** it is applied in practice
- **Related problems** it solves or introduces
- **Risk level** and **confidence score**

### 2. Embedding Generation
Each knowledge item is passed through the embedding model to produce a normalised float vector. These are stored in `KnowledgeEmbedding` and queried via cosine similarity at retrieval time.

**Offline Fallback:** If no `OPENAI_API_KEY` is provided, a deterministic n-gram vectorizer produces reproducible embeddings, keeping the full platform operational with zero external dependencies.

### 3. RAG Response Pipeline
```
User Query
    │
    ▼
Embed query ──► Cosine similarity over KnowledgeEmbedding
    │
    ▼
Retrieve top-k KnowledgeItems (ranked by similarity score)
    │
    ▼
Assemble context: items + source provenance + graph neighbours
    │
    ▼
LLM prompt with system instruction:
  "Respond with: Recommended Action | Why | Context | Cited Sources"
    │
    ▼
Structured JSON response rendered in the Assistant UI
```

### 4. Knowledge Gap Detection
The system automatically identifies gaps by:
- Analysing coverage scores per domain and flagging domains below threshold
- Cross-referencing employee knowledge concentration ratios
- Surfacing items that are referenced in the graph but never documented

### 5. Exit Mode Engine
The flagship feature uses an adaptive interview loop:
1. Identify all `KnowledgeItems` held by the departing employee
2. Classify items as **documented** vs **tacit-only**
3. Generate targeted technical questions for each tacit gap
4. Record and embed the employee's answers in real-time
5. Update graph relationships and re-calculate coverage score
6. Export a signed-off **Knowledge Transfer Report** (JSON + print)

---

## 🗃️ Database Schema Overview

```
User ──────────────────────────────────────────────────────────┐
  │ (role: ADMIN | MANAGER | EMPLOYEE | NEW_EMPLOYEE)          │
  │                                                            │
Employee ──────────────────────────────────────────────────────┤
  │ (tacitKnowledgeRisk, coverageScore, concentrationRatio)    │
  │                                                            │
  ├── KnowledgeItem (what, why, confidence, risk)              │
  │     ├── KnowledgeSource (provenance: doc, transcript, chat)│
  │     ├── KnowledgeEmbedding (float vector)                  │
  │     └── KnowledgeRelationship (OWNS/DEPLOYS/SOLVES/...)    │
  │                                                            │
  ├── KnowledgeGap (domain, severity, suggestedQuestions)      │
  │                                                            │
  └── ExitSession                                              │
        ├── ExitQuestion (generated, adaptive)                 │
        └── ExitAnswer (raw text + embedded)                   │
                                                               │
Project ───────────────────────────────────────────────────────┘
  (systemBoundaries, domainScores, ownerEmployee)

KnowledgeConflict (contradiction detection + reconciliation)
Activity + Notification (audit trail + real-time alerts)
```

---

## 📐 Coverage Score Formula

The coverage score is a **mathematical composite** across 8 knowledge domains, each weighted by criticality:

```
CoverageScore = Σ(domain_score × domain_weight) / Σ(domain_weight)

Domains:
  Architecture     (weight: 20%) — System design, component relationships
  Deployment       (weight: 15%) — CI/CD, environment configs, runbooks
  Troubleshooting  (weight: 15%) — Known failure modes, debug procedures
  Business Rules   (weight: 15%) — Regulatory logic, pricing, edge policies
  Edge Cases       (weight: 10%) — Corner cases, known footguns
  Integrations     (weight: 10%) — Third-party API contracts and quirks
  Processes        (weight: 10%) — Team workflows, on-call rotation, escalation
  Undoc. Decisions (weight: 5%)  — Historic architectural trade-offs
```

---

## 🗺️ Application Routes

| Route | Component | Access |
| :--- | :--- | :--- |
| `/` | Landing Page | Public |
| `/login` | Auth (4 demo personas) | Public |
| `/dashboard` | Coverage overview, risk alerts | All roles |
| `/graph` | Interactive Knowledge Graph | All roles |
| `/assistant` | RAG Chat with citations | All roles |
| `/knowledge` | Knowledge item browser | All roles |
| `/gaps` | Gap list + AI question generator | MANAGER / ADMIN |
| `/exit-mode` | Employee exit interview engine | MANAGER / ADMIN |
| `/employees` | Employee knowledge profiles | MANAGER / ADMIN |
| `/projects` | Project knowledge coverage | MANAGER / ADMIN |
| `/sources` | Source document manager | EMPLOYEE+ |
| `/capture` | Manual knowledge capture form | EMPLOYEE+ |
| `/coverage` | Detailed 8-domain coverage breakdown | MANAGER / ADMIN |
| `/reviews` | Knowledge verification queue | ADMIN |
| `/settings` | AI config, integrations, RBAC | ADMIN |
| `/activity` | Real-time audit trail | ADMIN |

---

## 🔐 Role-Based Access Control (RBAC)

| Permission | ADMIN | MANAGER | EMPLOYEE | NEW_EMPLOYEE |
| :--- | :---: | :---: | :---: | :---: |
| View Dashboard & Graph | ✅ | ✅ | ✅ | ✅ |
| Query RAG Assistant | ✅ | ✅ | ✅ | ✅ |
| Add Knowledge Items | ✅ | ✅ | ✅ | ❌ |
| Manage Exit Sessions | ✅ | ✅ | ❌ | ❌ |
| Resolve Knowledge Gaps | ✅ | ✅ | ❌ | ❌ |
| Verify/Approve Knowledge | ✅ | ❌ | ❌ | ❌ |
| Configure AI & System | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Roadmap (Post-Hackathon)

### Phase 1 — Integrations (Q4 2026)
- [ ] Slack workspace connector (auto-ingest channel history)
- [ ] Confluence / Notion page sync
- [ ] GitHub repository connector (code comments, PRs, issues)
- [ ] Google Meet / Zoom transcript ingestion

### Phase 2 — Enterprise Features (Q1 2027)
- [ ] SSO / SAML authentication
- [ ] PostgreSQL production deployment with migrations
- [ ] Multi-tenant organisation support
- [ ] Audit logs export (SOC2 compliance)
- [ ] Knowledge expiry & re-verification workflows

### Phase 3 — Advanced AI (Q2 2027)
- [ ] Contradiction detection with auto-reconciliation suggestions
- [ ] Multi-modal knowledge: voice memos, screen recordings
- [ ] Proactive push notifications: "This knowledge is 90 days old, re-verify?"
- [ ] Fine-tuned domain-specific embedding models

---

## 👥 Team

Built at **Dev2Hack 2026** Hackathon.

---

*KnowledgeVault AI — Because experience should outlast employment.*
