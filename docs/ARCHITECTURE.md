# Architecture — Drug Interaction Checker

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                               │
│                     apps/web  (React + Vite)                        │
│                         Port: 5173                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / REST
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NODE.JS API SERVICE                               │
│                  services/api  (Express + TS)                        │
│                         Port: 3001                                  │
│                                                                     │
│  Routes:                                                            │
│  GET  /api/v1/drugs/search        Drug search (in-memory cache)     │
│  GET  /api/v1/drugs/stats         Live DB statistics                │
│  GET  /api/v1/drugs/details/:name Drug pharmacology details         │
│  POST /api/v1/interactions/check  Database interaction lookup       │
│  POST /api/v1/interactions/explain → proxy → AI Engine             │
│  GET  /api/v1/profiles            Patient profile CRUD (auth'd)     │
│  POST /api/v1/profiles                                              │
│  DEL  /api/v1/profiles/:id                                          │
└──────────┬──────────────────────────────────┬───────────────────────┘
           │                                  │ HTTP (internal)
           │ Prisma ORM                        ▼
           ▼                     ┌─────────────────────────────────────┐
┌─────────────────┐              │        PYTHON AI ENGINE             │
│   MongoDB Atlas  │              │  services/ai-engine  (FastAPI)      │
│   (Drug + Inter  │              │          Port: 3002                 │
│   action data)   │              │                                     │
│  1,700+ drugs    │              │  POST /explain                      │
│  190,000+ pairs  │              │    Stage 1: Groq LLM               │
└─────────────────┘              │      → 3-5 search queries           │
                                 │    Stage 2: Tavily (parallel)        │
                                 │      → medical literature search     │
                                 │    Stage 3: Groq LLM (70B)          │
                                 │      → clinical synthesis            │
                                 └──────────────────┬──────────────────┘
                                                    │
                         ┌──────────────────────────┘
                         │  External APIs
                         ├── Groq Cloud (LLM inference)
                         └── Tavily (medical web search)
```

## Service Responsibilities

| Service | Language | Responsibility |
|---------|----------|----------------|
| `apps/web` | React + Vite | Clinical UI, drug search, interaction graph, PDF export |
| `services/api` | Node.js + TypeScript | REST API, auth, DB access, audit logging, proxy to AI |
| `services/ai-engine` | Python + FastAPI | AI explain pipeline (Groq + Tavily) |

## Authentication Flow

```
Browser → Clerk (hosted auth) → JWT token
Token sent in: Authorization: Bearer <token>
API verifies via: @clerk/clerk-sdk-node (ClerkExpressRequireAuth)
Protected routes: /api/v1/profiles/*
```

## AI Explain Pipeline (≈5-15 seconds)

```
POST /api/v1/interactions/explain
    │
    │ (Node.js validates + audit-logs)
    │
    ▼
POST http://ai-engine:3002/explain
    │
    ├─ Stage 1: Groq (llama-3.1-8b-instant)
    │     "Break this into 3-5 search queries" → JSON array
    │
    ├─ Stage 2: Tavily (parallel, 5 queries × 5 results)
    │     Domains: PubMed, FDA, NEJM, BMJ, Lancet, Medscape…
    │     → deduplicated, max 15 unique sources
    │
    └─ Stage 3: Groq (llama-3.3-70b-versatile)
          "Synthesize a clinical narrative with citations"
          → 250-350 word explanation + source list
```

## Data Flow: Drug Interaction Check

```
1. User selects drugs (debounced 300ms search → GET /drugs/search)
2. 600ms after drug list change → POST /interactions/check
3. Prisma queries MongoDB: WHERE drug1 IN [...] AND drug2 IN [...]
4. Results rendered as severity cards (Major / Moderate / Minor)
5. Click "Explain" → POST /interactions/explain → AI pipeline
6. Explanation + citations rendered in collapsible panel
7. jsPDF generates report (includes AI text if available)
```

## HIPAA Compliance

Every interaction check and AI explain call creates an immutable `AuditLog` record in MongoDB containing:
- `clerkId` — authenticated user
- `action` — CHECK_INTERACTION or EXPLAIN_INTERACTION  
- `resource` — drug names checked
- `ipAddress` — client IP
- `timestamp` — UTC

## Directory Structure

```
drug-interaction-checker/
├── apps/
│   └── web/                    # React + Vite frontend
│       ├── src/
│       │   ├── components/     # Reusable UI (Auth, Header, Sidebar…)
│       │   ├── pages/          # Route-level views
│       │   └── index.css       # Design system (CSS variables)
│       └── public/
│
├── services/
│   ├── api/                    # Node.js / Express API
│   │   ├── src/
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── routes/         # Express routers
│   │   │   ├── middlewares/    # Auth, validation, error handler
│   │   │   ├── utils/          # Logger, audit log
│   │   │   └── validation/     # Zod schemas
│   │   └── prisma/             # MongoDB schema
│   │
│   └── ai-engine/              # Python FastAPI AI microservice
│       ├── main.py             # FastAPI app entry
│       ├── routers/
│       │   └── explain.py      # POST /explain route
│       └── services/
│           └── pipeline.py     # 3-stage Groq + Tavily pipeline
│
├── docs/
│   ├── ARCHITECTURE.md         # This file
│   └── API.md                  # REST API reference
│
├── .github/workflows/ci.yml    # GitHub Actions (3 parallel jobs)
├── docker-compose.yml          # Orchestrates all 3 services
├── Makefile                    # Developer shortcuts
└── .env.example                # Root env template for docker-compose
```
