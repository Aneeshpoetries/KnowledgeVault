<<<<<<< HEAD
# KnowledgeVault AI 🧠
### AI Knowledge Continuity & Organizational Memory System

> **Tagline**: *"Turn employee experience into a living, searchable organizational memory."*

---

## 📌 Executive Overview

Critical organizational knowledge often lives inside employees' heads, old chats, incident post-mortems, emails, documents, meeting discussions, code comments, and undocumented workflows. When experienced staff leave, organizations suffer acute brain drain, and successors spend months rebuilding context.

**KnowledgeVault AI** is a production-grade enterprise platform that continuously converts scattered employee experience into a structured, searchable, connected, evidence-backed organizational memory.

### The Core Product Differentiator
Unlike static wikis or standard document search tools, KnowledgeVault AI captures:
- **Not just what** the company knows, but **why it matters**.
- **Where it came from** (complete source traceability and exact citations).
- **How reliable it is** (confidence rating & last verified audit date).
- **What it connects to** (interactive multi-entity Knowledge Graph).
- **What knowledge is still missing** (dynamic Knowledge Gap detection).
- **Active recovery before departure** (Flagship **Employee Exit Mode**).

---

## 🚀 The Core Product Workflow

```
COLLECT ──► UNDERSTAND ──► CONNECT ──► ASSIST ──► COVERAGE ──► EXIT MODE
 (Docs,       (AI Structuring   (Knowledge Graph  (RAG Assistant    (Mathematical     (Interactive
 Transcripts,  & Validation)     Entities &        Evidence Cites)   8-Domain Score)   Knowledge Transfer
 Chat, Runbooks)                 Dependencies)                                          & Recovery)
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, `@xyflow/react` (React Flow) for interactive Knowledge Graph visualization.
- **Backend**: Next.js App Router Server Endpoints & Server Actions.
- **Database & ORM**: PostgreSQL / SQLite via Prisma ORM.
- **Vector & Embeddings**: Clean vector-storage abstraction with normalized float cosine similarity search. Embeddings generated via OpenAI Embedding API or local deterministic semantic n-gram vectorizer.
- **AI & RAG Engine**: OpenAI-compatible LLM abstraction (`OPENAI_API_KEY`, configurable model via `LLM_MODEL`) with intelligent local heuristic fallback engine ensuring 100% offline and demo reliability without third-party failures.
- **Document Processing**: Real file ingestion supporting **PDF** (`pdf-parse`), **DOCX** (`mammoth`), **Markdown**, **TXT**, **JSON**, and **CSV**.

---

## 🏢 Demo Persona & Evaluation Credentials

KnowledgeVault AI comes pre-seeded with realistic enterprise data from **NovaTech Systems**. Four pre-configured roles are available on `/login`:

| Role | Name | Title | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **ADMIN** | Admin User (`admin@novatech.ai`) | VP of Engineering | Full system governance, AI configuration, knowledge verification. |
| **MANAGER** | Sarah Chen (`manager@novatech.ai`) | Engineering Manager | Team coverage monitoring, gap resolution, exit mode oversight. |
| **EMPLOYEE** | Rahul Sharma (`rahul@novatech.ai`) | Senior Backend Architect | Core payment engineer holding 73% tacit operational knowledge. |
| **NEW_EMPLOYEE**| Alex Rivera (`newhire@novatech.ai`) | Associate Engineer | Context rebuild mode, querying AI runbooks with citations. |

---

## ⚡ Primary Hackathon Demo Walkthrough

1. **Dashboard (`/dashboard`)**:
   - Observe **54% overall knowledge coverage**.
   - Notice **Rahul Sharma** holds a critical **73% knowledge concentration** in the Payment System.
   - Review category coverage: Architecture (90%), Deployment (70%), Troubleshooting (50%), Business Rules (40%), Edge Cases (20%).
2. **Knowledge Graph (`/graph`)**:
   - Inspect interactive nodes: `Rahul Sharma` ──► `Payment System` ──► `Java / Spring Boot` ──► `Payment Deployment` ──► `Timeout Issue` ──► `Solution`.
   - Click any node to open the live entity detail side-panel.
3. **RAG AI Assistant (`/assistant`)**:
   - Ask: *"How do I deploy the payment service?"*
   - Verify the assistant responds with **Recommended Action**, **Why**, **Relevant Context**, and **Cited Sources** (`Payment Deployment Review - March 12`).
4. **Knowledge Gaps (`/gaps`)**:
   - Notice open critical gaps: *Payment Failure Recovery & Failover Handling*.
   - Click **Generate AI Questions** to dynamically synthesize gap-filling technical prompts.
5. **Employee Exit Mode (`/exit-mode`) — THE KILLER FEATURE**:
   - Select **Rahul Sharma**.
   - Review **Already Documented** vs **Missing Tacit Experience**.
   - The AI asks targeted technical questions regarding production failovers.
   - Click a quick demo answer (e.g. *Peak Billing Timeout & Envoy 8500ms* or *Adyen CLI switchover*).
   - Watch the LLM process the answer in real-time, generate embeddings, and link the new item to the graph.
   - Watch **Coverage jump from 54% to 78%**!
   - Click **Export Report JSON** or **Print** for the *Exit Knowledge Transfer Report*.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18, v20, v22, or v24)
- npm (v9+)

### Installation

```bash
# 1. Clone repository and navigate to workspace
git clone <repo-url>
cd AI_Continuity_System

# 2. Install dependencies
npm install

# 3. Initialize SQLite database & Prisma Client
npm run db:push

# 4. Seed realistic NovaTech enterprise dataset
npm run db:seed

# 5. Run tests
npm test

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create `.env` in the root directory (or copy `.env.example`):

```ini
# Database Connection (SQLite default for zero-setup local dev; PostgreSQL supported)
DATABASE_URL="file:./dev.db"

# AI Configuration (Optional for demo; intelligent fallback operates if omitted)
OPENAI_API_KEY=""
OPENAI_BASE_URL="https://api.openai.com/v1"
LLM_MODEL="gpt-4o-mini"
EMBEDDING_MODEL="text-embedding-3-small"

# Auth & App Settings
NEXTAUTH_SECRET="knowledgevault-secret-key-demo-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📊 Database Schema Summary

Key models implemented in `prisma/schema.prisma`:
- `User`: Role-based authentication (ADMIN, MANAGER, EMPLOYEE, NEW_EMPLOYEE).
- `Employee`: Tacit knowledge holder, risk level, coverage score, concentration ratio.
- `Project`: System boundaries, domain scores (architecture, deployment, troubleshooting, edge cases).
- `KnowledgeItem`: Atomic verified procedural items with risk, confidence, whyItMatters, problems, and solutions.
- `KnowledgeSource`: Provenance tracking for documents, meeting transcripts, slack exports.
- `KnowledgeEmbedding`: Vector embeddings for semantic cosine similarity search.
- `KnowledgeRelationship`: Graph connections (`OWNS`, `DEPLOYS`, `SOLVES`, `CONFLICTS_WITH`).
- `KnowledgeGap`: Proactively detected organizational blind spots.
- `ExitSession`, `ExitQuestion`, `ExitAnswer`: Flagship offboarding continuity capture engine.
- `KnowledgeConflict`: Detected operational contradictions with reconciliation workflows.
- `Activity` & `Notification`: Real-time audit trails and alerting.

---

## 🧪 Testing

The repository contains an automated Node.js test suite:

```bash
npm test
```

Tests verify:
1. Deterministic embedding calculation & vector cosine similarity.
2. Knowledge item creation & database integrity.
3. Knowledge graph relationship auto-construction.
4. Dynamic coverage mathematical calculation (verifying scores are derived from real items).
5. Knowledge gap detection & impact classification.
6. Exit Mode session initialization and adaptive question generation.

---

## 🛡️ License

MIT License. Developed for enterprise knowledge continuity and organizational memory resilience.
=======
# KnowledgeVault-AI
>>>>>>> 74980ab58255c0bf1eeac15da2115403a78ca8f9
