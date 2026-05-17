"""
Drug Interaction AI Engine — FastAPI Microservice
--------------------------------------------------
Exposes a single endpoint:
  POST /explain   →  3-stage pipeline:
    1. Groq LLM   → question decomposition (search queries)
    2. Tavily     → parallel medical literature search
    3. Groq LLM   → clinical synthesis with citations

Consumed by the Node.js API service via an internal HTTP proxy.
"""

import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import explain

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AI Engine starting up …")
    # Validate required keys on startup so errors surface immediately.
    if not os.getenv("GROQ_API_KEY"):
        logger.error("Missing required GROQ_API_KEY variable — /explain will return 503")
    if not os.getenv("TAVILY_API_KEY"):
        logger.warning("Missing optional TAVILY_API_KEY variable — will use high-fidelity LLM citation fallback")
    yield
    logger.info("AI Engine shutting down.")


app = FastAPI(
    title="Drug Interaction AI Engine",
    description="Research assistant pipeline: Groq + Tavily medical literature synthesis.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — only the API service (and dev frontend) need access
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3001,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(explain.router, prefix="/explain", tags=["explain"])


@app.get("/health", tags=["health"])
async def health():
    """Health check used by docker-compose and load balancers."""
    groq_ok = bool(os.getenv("GROQ_API_KEY"))
    tavily_ok = bool(os.getenv("TAVILY_API_KEY"))
    return {
        "status": "ok" if groq_ok else "degraded",
        "groq_configured": groq_ok,
        "tavily_configured": tavily_ok,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error in AI engine."},
    )
