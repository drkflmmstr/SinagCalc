"""
api/routes/explainer.py
───────────────────────
POST /explain — streams an AI-generated explanation of a calculation
result using the Gemini API.

Uses FastAPI's StreamingResponse with server-sent events (SSE) so the
frontend can display text as it arrives rather than waiting for the
full response. If the Gemini API key is not configured, returns a
graceful fallback message instead of an error.
"""

import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from api.schemas import ExplainRequest
from calculator.explainer import build_prompt
from config import settings

router = APIRouter(tags=["Explainer"])
logger = logging.getLogger(__name__)


@router.post(
    "/explain",
    summary="AI explanation of calculation results",
    response_description="Server-sent event stream of explanation text chunks",
)
async def explain(req: ExplainRequest) -> StreamingResponse:
    """
    Accepts a full CalculationResponse and a language preference,
    builds a Gemini prompt, and streams the response back as SSE.

    Each SSE event has the format:
        data: <chunk of text>\\n\\n

    A final sentinel event signals completion:
        data: [DONE]\\n\\n

    The frontend reads this stream and appends each chunk to the UI
    as it arrives, producing a typewriter effect.

    If GEMINI_API_KEY is not configured, streams a polite fallback
    message explaining how to enable the feature.
    """
    result_dict = req.result.model_dump()
    language    = req.language

    if not settings.gemini_configured():
        return StreamingResponse(
            _fallback_stream(language),
            media_type="text/event-stream",
            headers=_sse_headers(),
        )

    prompt = build_prompt(result_dict, language)

    return StreamingResponse(
        _gemini_stream(prompt),
        media_type="text/event-stream",
        headers=_sse_headers(),
    )


# ── Private helpers ────────────────────────────────────────────────────────────

def _sse_headers() -> dict:
    """Standard headers for SSE streaming responses."""
    return {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",  # Disables Nginx buffering — important for streaming
    }


async def _gemini_stream(prompt: str) -> AsyncGenerator[str, None]:
    """
    Call Gemini with streaming enabled and yield each text chunk as an SSE event.
    Falls back gracefully if the API call fails.
    """
    try:
        async for event in _stream_gemini_text(prompt):
            yield event

    except Exception as e:
        logger.exception("Gemini explainer failed: %s", e)
        yield f"data: {json.dumps('Sorry, the AI explainer encountered an error. Your calculation results above are still accurate.')}\n\n"
        yield "data: [DONE]\n\n"


async def _stream_gemini_text(prompt: str) -> AsyncGenerator[str, None]:
    """
    Stream text from Gemini using the current SDK when available, with a
    compatibility fallback for the older google-generativeai package.
    """
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content_stream(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=400,
                top_p=0.9,
            ),
        )

        for chunk in response:
            if getattr(chunk, "text", None):
                yield f"data: {json.dumps(chunk.text)}\n\n"

        yield "data: [DONE]\n\n"
        return

    except ImportError:
        # Older projects may still have google-generativeai installed.
        pass

    import google.generativeai as genai

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config={
            "temperature": 0.7,
            "max_output_tokens": 400,
            "top_p": 0.9,
        },
    )

    response = model.generate_content(prompt, stream=True)

    for chunk in response:
        if getattr(chunk, "text", None):
            yield f"data: {json.dumps(chunk.text)}\n\n"

    yield "data: [DONE]\n\n"


async def _fallback_stream(language: str) -> AsyncGenerator[str, None]:
    """
    Yields a friendly message when no API key is configured.
    Useful during development before a key is obtained.
    """
    if language == "filipino":
        msg = (
            "Ang AI explainer ay hindi pa naka-configure. "
            "Para i-activate ito, maglagay ng iyong Gemini API key "
            "sa GEMINI_API_KEY environment variable. "
            "Makakakuha ng libreng key sa aistudio.google.com. "
            "Ang iyong mga resulta sa itaas ay tama at maaasahan."
        )
    else:
        msg = (
            "The AI explainer is not yet configured. "
            "To activate it, add your Gemini API key to the "
            "GEMINI_API_KEY environment variable. "
            "You can get a free key at aistudio.google.com. "
            "Your calculation results above are accurate and complete."
        )

    # Stream it word by word to keep the typewriter effect even for the fallback
    words = msg.split(" ")
    for i, word in enumerate(words):
        chunk = word if i == len(words) - 1 else word + " "
        yield f"data: {json.dumps(chunk)}\n\n"

    yield "data: [DONE]\n\n"
