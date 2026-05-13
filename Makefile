# Drug Interaction Checker — Developer Makefile
# Usage: make <target>

.PHONY: help install dev dev-api dev-web dev-ai test lint clean docker-up docker-down

# Default target
help:
	@echo ""
	@echo "╔═══════════════════════════════════════════════════╗"
	@echo "║   Drug Interaction Checker — Developer Commands   ║"
	@echo "╚═══════════════════════════════════════════════════╝"
	@echo ""
	@echo "  install        Install all dependencies"
	@echo "  dev            Start all three services concurrently"
	@echo "  dev-api        Start only the Node.js API service"
	@echo "  dev-web        Start only the React frontend"
	@echo "  dev-ai         Start only the Python AI engine"
	@echo "  test           Run all test suites"
	@echo "  test-api       Run Node.js API tests"
	@echo "  lint           Lint all services"
	@echo "  docker-up      Start all services via Docker Compose"
	@echo "  docker-down    Stop Docker Compose services"
	@echo "  clean          Remove build artifacts and caches"
	@echo ""

# ── Install ────────────────────────────────────────────────────────────────

install: install-api install-web install-ai

install-api:
	@echo "📦  Installing API dependencies…"
	cd services/api && npm install

install-web:
	@echo "📦  Installing Web dependencies…"
	cd apps/web && npm install

install-ai:
	@echo "🐍  Creating Python virtual environment and installing AI engine dependencies…"
	cd services/ai-engine && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# ── Development ────────────────────────────────────────────────────────────

dev:
	@echo "🚀  Starting all services…"
	@make -j3 dev-api dev-web dev-ai

dev-api:
	@echo "⚙️   Starting API service on :3001…"
	cd services/api && npm run dev

dev-web:
	@echo "🌐  Starting Web app on :5173…"
	cd apps/web && npm run dev

dev-ai:
	@echo "🤖  Starting AI engine on :3002…"
	cd services/ai-engine && .venv/bin/uvicorn main:app --host 0.0.0.0 --port 3002 --reload

# ── Testing ────────────────────────────────────────────────────────────────

test: test-api

test-api:
	@echo "🧪  Running API tests…"
	cd services/api && npm test

# ── Linting ────────────────────────────────────────────────────────────────

lint:
	@echo "🔍  Linting API…"
	cd services/api && npx tsc --noEmit
	@echo "🔍  Linting Web…"
	cd apps/web && npm run lint

# ── Docker ────────────────────────────────────────────────────────────────

docker-up:
	@echo "🐳  Starting all services via Docker Compose…"
	docker-compose up --build

docker-down:
	@echo "🛑  Stopping Docker Compose services…"
	docker-compose down

# ── Clean ─────────────────────────────────────────────────────────────────

clean:
	@echo "🧹  Cleaning build artifacts…"
	rm -rf services/api/dist
	rm -rf apps/web/dist
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null; true
	find . -name "*.pyc" -delete 2>/dev/null; true
