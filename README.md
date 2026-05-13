# Drug Interaction Checker

> A production-grade clinical decision support system that tells you **exactly why** a drug combination is dangerous — backed by live medical literature, in plain language, in seconds.

[![CI](https://github.com/tushar73-jet/drug-interaction-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/tushar73-jet/drug-interaction-checker/actions)

---

## What It Does

Clinicians select drugs → the system checks 190,000+ interaction pairs in the database → **AI explains the mechanism, risk, and management guidance**, citing real PubMed / FDA / NEJM sources — all in one workflow.

## Architecture

Three independent services — each in its own language and container:

| Service | Stack | Port |
|---------|-------|------|
| `apps/web` | React 19 + Vite | 5173 |
| `services/api` | Node.js + Express + TypeScript + Prisma | 3001 |
| `services/ai-engine` | **Python 3.12 + FastAPI** + Groq + Tavily | 3002 |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system diagram.

## Features

- **Drug Search** — in-memory cache, debounced, 1,700+ drugs
- **Interaction Database** — 190,000+ interaction pairs, Major / Moderate / Minor severity
- **AI Explain Pipeline** — 3-stage: Groq query decomposition → Tavily parallel search → Groq clinical synthesis with citations
- **Interactive Graph** — drug nodes, severity-coloured edges, click-to-highlight
- **Patient Profiles** — saved to MongoDB, synced across sessions (Clerk auth)
- **PDF Reports** — includes AI explanations + source citations
- **HIPAA Audit Logging** — every check creates an immutable audit record
- **Dark Mode** — system-aware with manual toggle

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+
- MongoDB Atlas connection string
- Clerk account (free)
- Groq API key — [console.groq.com](https://console.groq.com) (free tier)
- Tavily API key — [app.tavily.com](https://app.tavily.com) (free tier)

### 1. Clone & Configure

```bash
git clone https://github.com/tushar73-jet/drug-interaction-checker.git
cd drug-interaction-checker

# Copy the root env template
cp .env.example .env
# Fill in your keys in .env
```

### 2. Install All Dependencies

```bash
make install
```

### 3. Start All Services

```bash
make dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| API | http://localhost:3001 |
| AI Engine | http://localhost:3002 |

### Alternative: Run Individually

```bash
make dev-api    # Node.js API on :3001
make dev-web    # React frontend on :5173
make dev-ai     # Python AI engine on :3002
```

### Docker

```bash
docker-compose up --build
# or:
make docker-up
```

## Environment Variables

### Root `.env` (for Docker Compose)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `DATABASE_URL` | ✅ | MongoDB Atlas connection string |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `GROQ_API_KEY` | ✅ | Groq LLM API key |
| `TAVILY_API_KEY` | ✅ | Tavily search API key |

Each service also has its own `.env.example` — see `services/api/.env.example` and `services/ai-engine/.env.example`.

## Testing

```bash
make test        # All tests
make test-api    # Node.js API unit tests only
```

## Project Structure

```
drug-interaction-checker/
├── apps/
│   └── web/                 # React + Vite frontend
├── services/
│   ├── api/                 # Node.js / Express / TypeScript
│   └── ai-engine/           # Python / FastAPI / Groq / Tavily
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
├── .github/workflows/ci.yml
├── docker-compose.yml
├── Makefile
└── .env.example
```

## License

ISC — see [LICENSE](LICENSE).
