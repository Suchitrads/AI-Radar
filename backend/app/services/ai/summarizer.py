from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.schemas import SummaryResult


SUMMARY_INSTRUCTION = """
You are an AI technology news editor.

Create a concise summary of the supplied article.

Requirements:

Headline:
- approximately 15 words maximum
- specific and informative

Summary:
- 1 to 3 concise sentences
- explain what actually happened

Why it matters:
- exactly one strong sentence
- explain the practical impact

Avoid:
- "This article discusses..."
- generic AI hype
- filler
- unsupported claims
- repeating the headline
"""


def get_client() -> genai.Client:

    if not settings.gemini_api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(
        api_key=settings.gemini_api_key
    )


def summarize_story(
    title: str,
    content: str,
) -> SummaryResult:

    client = get_client()

    model = settings.gemini_summary_model

    if not model:
        raise RuntimeError(
            "GEMINI_SUMMARY_MODEL is not configured."
        )

    prompt = f"""
{SUMMARY_INSTRUCTION}

ORIGINAL TITLE:
{title}

ARTICLE CONTENT:
{content[:15000]}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SummaryResult,
        ),
    )

    if response.parsed:
        return response.parsed

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return SummaryResult.model_validate_json(
        response.text
    )