from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.schemas import ClassificationResult


CLASSIFIER_INSTRUCTION = """
You are an AI technology intelligence analyst.

Analyze the supplied article and classify its actual significance.

Prioritize:
- meaningful new AI models
- AI products
- APIs and SDKs
- AI agents
- research
- open-source releases
- infrastructure
- developer tooling
- robotics
- acquisitions
- regulation
- AI security
- meaningful pricing or API changes

Down-rank:
- generic tutorials
- opinion pieces
- SEO content
- marketing filler
- repeated announcements
- speculation without evidence
- low-information promotional content

Do not invent facts that are not supported by the article.

Return only the requested structured classification.
"""


def get_client() -> genai.Client:
    if not settings.gemini_api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(
        api_key=settings.gemini_api_key
    )


def classify_story(
    title: str,
    content: str,
) -> ClassificationResult:

    client = get_client()

    model = settings.gemini_classifier_model

    if not model:
        raise RuntimeError(
            "GEMINI_CLASSIFIER_MODEL is not configured."
        )

    prompt = f"""
{CLASSIFIER_INSTRUCTION}

ARTICLE TITLE:
{title}

ARTICLE CONTENT:
{content[:15000]}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ClassificationResult,
        ),
    )

    if response.parsed:
        return response.parsed

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return ClassificationResult.model_validate_json(
        response.text
    )