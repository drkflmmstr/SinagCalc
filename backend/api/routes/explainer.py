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
        explanation = _generate_gemini_text(prompt)

        if not explanation.strip():
            raise ValueError("Gemini returned an empty explanation.")

        for chunk in _chunk_text(explanation):
            yield f"data: {json.dumps(chunk)}\n\n"

        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.exception("Gemini explainer failed: %s", e)
        if settings.app_env == "development":
            debug_msg = f"Gemini error: {type(e).__name__}: {e}"
            yield f"data: {json.dumps(debug_msg)}\n\n"
        else:
            yield f"data: {json.dumps('Sorry, the AI explainer encountered an error. Your calculation results above are still accurate.')}\n\n"
        yield "data: [DONE]\n\n"


def _generate_gemini_text(prompt: str) -> str:
    """
    Generate the full explanation first, then let our SSE layer chunk it.
    This avoids truncation issues from the provider SDK streaming path.
    """
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=1500,
                top_p=0.95,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        return _extract_response_text(response)

    except ImportError:
        # Older projects may still have google-generativeai installed.
        pass

    import google.generativeai as genai

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config={
            "temperature": 0.7,
            "max_output_tokens": 1500,
            "top_p": 0.95,
        },
    )

    response = model.generate_content(prompt)
    return _extract_response_text(response)


def _chunk_text(text: str, words_per_chunk: int = 8) -> list[str]:
    """Split the full explanation into small chunks for the UI typewriter effect."""
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    for i in range(0, len(words), words_per_chunk):
        segment = " ".join(words[i:i + words_per_chunk])
        if i + words_per_chunk < len(words):
            segment += " "
        chunks.append(segment)

    return chunks


def _extract_response_text(response: object) -> str:
    """
    Prefer explicit candidate/part extraction over a single `.text` accessor,
    which can be incomplete depending on SDK/version combinations.
    """
    direct_text = (getattr(response, "text", None) or "").strip()

    parts_text: list[str] = []
    for candidate in getattr(response, "candidates", []) or []:
        content = getattr(candidate, "content", None)
        for part in getattr(content, "parts", []) or []:
            text = getattr(part, "text", None)
            if text:
                parts_text.append(text)

    combined_parts = "".join(parts_text).strip()

    if combined_parts and len(combined_parts) >= len(direct_text):
        return combined_parts

    return direct_text




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