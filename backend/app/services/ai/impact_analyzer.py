from google import genai
from google.genai import types

from app.core.config import settings
from app.models.project import Project
from app.models.story import Story
from app.services.ai.schemas import ImpactResult


IMPACT_INSTRUCTION = """
You are an AI technology impact analyst.

Determine whether the supplied AI news story has meaningful
impact on the supplied software project.

Compare:

1. Project technologies
2. Project AI stack
3. Project topics
4. Project infrastructure
5. Story technologies
6. Story topics
7. Story companies and products
8. Story content

Do NOT assume that every AI news story affects the project.

Score impact from 0 to 10.

Use:

0-2   = No meaningful impact
3-4   = Low
5-6   = Medium
7-8   = High
9-10  = Critical

Possible impact types include:
- technology
- dependency
- security
- cost
- capability
- opportunity
- compatibility
- regulatory

Give a practical recommendation.

Do not invent information.
"""


def _client() -> genai.Client:

    if not settings.gemini_api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(
        api_key=settings.gemini_api_key
    )


def _project_context(
    project: Project,
) -> str:

    technologies = [
        item.technology
        for item in project.technologies
    ]

    topics = [
        item.topic
        for item in project.topics
    ]

    return f"""
PROJECT NAME:
{project.name}

DESCRIPTION:
{project.description or ""}

FRONTEND:
{project.frontend or ""}

BACKEND:
{project.backend or ""}

DATABASE:
{project.database or ""}

INFRASTRUCTURE:
{project.infrastructure or ""}

AI STACK:
{project.ai_stack or ""}

TECHNOLOGIES:
{", ".join(technologies)}

TOPICS:
{", ".join(topics)}
"""


def analyze_impact(
    project: Project,
    story: Story,
) -> ImpactResult:

    client = _client()

    model = settings.gemini_classifier_model

    if not model:
        raise RuntimeError(
            "GEMINI_CLASSIFIER_MODEL is not configured."
        )

    story_content = (
        story.clean_content
        or story.raw_content
        or ""
    )

    prompt = f"""
{IMPACT_INSTRUCTION}

{_project_context(project)}

AI STORY:

TITLE:
{story.title}

SUMMARY:
{story.summary or ""}

COMPANIES:
{story.companies or ""}

TECHNOLOGIES:
{story.technologies or ""}

TOPICS:
{story.topics or ""}

CONTENT:
{story_content[:12000]}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ImpactResult,
        ),
    )

    if response.parsed:
        return response.parsed

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty impact response."
        )

    return ImpactResult.model_validate_json(
        response.text
    )