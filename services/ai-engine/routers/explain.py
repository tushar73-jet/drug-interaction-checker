"""
routers/explain.py
------------------
POST /explain

Accepts a drug pair + known interaction description.
Returns a clinical explanation synthesized from live medical literature.
"""

import asyncio
import logging
import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from services.pipeline import run_explain_pipeline

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response Models ──────────────────────────────────────────────

class ExplainRequest(BaseModel):
    drug1: str = Field(..., min_length=1, max_length=100)
    drug2: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=2000)

    @field_validator("drug1", "drug2")
    @classmethod
    def sanitise_drug_name(cls, v: str) -> str:
        import re
        if not re.match(r"^[a-zA-Z0-9 '\-]+$", v.strip()):
            raise ValueError("Drug name contains invalid characters.")
        return v.strip()


class Citation(BaseModel):
    title: str
    url: str
    snippet: str


class ExplainResponse(BaseModel):
    status: str = "success"
    explanation: str
    citations: list[Citation]


class ChatRequest(BaseModel):
    drug1: str
    drug2: str
    context: str  # The previous explanation
    question: str
    citations: list[Citation] = []


class ChatResponse(BaseModel):
    status: str = "success"
    answer: str


# ── Routes ─────────────────────────────────────────────────────────────────

@router.post("", response_model=ExplainResponse, summary="AI-powered clinical explanation")
async def explain_interaction(body: ExplainRequest) -> Any:
    # ... existing code ...
    groq_key = os.getenv("GROQ_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")

    if not groq_key or not tavily_key:
        raise HTTPException(
            status_code=503,
            detail="AI explanation service is not configured. Contact the administrator.",
        )

    try:
        result = await run_explain_pipeline(
            drug1=body.drug1,
            drug2=body.drug2,
            description=body.description,
            groq_api_key=groq_key,
            tavily_api_key=tavily_key,
        )
        return ExplainResponse(**result)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="AI explanation timed out.")
    except Exception as exc:
        logger.exception("Explain pipeline failed: %s", exc)
        raise HTTPException(status_code=502, detail="AI service unavailable.")


@router.post("/chat", response_model=ChatResponse, summary="Ask follow-up questions")
async def chat_interaction(body: ChatRequest) -> Any:
    """
    Answers follow-up questions using the original explanation as context.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=503, detail="AI service not configured.")

    from services.pipeline import run_chat_pipeline
    
    try:
        answer = await run_chat_pipeline(
            drug1=body.drug1,
            drug2=body.drug2,
            context=body.context,
            question=body.question,
            citations=[c.dict() for c in body.citations],
            groq_api_key=groq_key
        )
        return ChatResponse(answer=answer)
    except Exception as exc:
        logger.exception("Chat pipeline failed: %s", exc)
        raise HTTPException(status_code=502, detail="AI service unavailable.")
