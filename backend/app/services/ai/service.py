import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.story import Story

from app.services.ai.classifier import (
    classify_story,
)
from app.services.ai.summarizer import (
    summarize_story,
)


logger = logging.getLogger(
    "ai_radar.intelligence"
)


def list_to_string(
    values: list[str],
) -> str:

    return ", ".join(
        value.strip()
        for value in values
        if value.strip()
    )


def process_story(
    db: Session,
    story: Story,
) -> str:

    content = (
        story.clean_content
        or story.raw_content
        or ""
    ).strip()

    if not content:
        logger.warning(
            "Story %s has no content",
            story.id,
        )

        return "rejected"


    try:

        classification = classify_story(
            title=story.title,
            content=content,
        )

        if not classification.is_ai_related:

            story.importance_score = 0
            story.novelty_score = 0
            story.technical_score = 0
            story.is_breaking = False

            db.commit()

            return "rejected"


        story.category = (
            classification.category
        )

        story.sub_category = (
            classification.sub_category
        )

        story.companies = list_to_string(
            classification.companies
        )

        story.technologies = list_to_string(
            classification.technologies
        )

        story.topics = list_to_string(
            classification.topics
        )

        story.importance_score = (
            classification.importance_score
        )

        story.novelty_score = (
            classification.novelty_score
        )

        story.technical_score = (
            classification.technical_score
        )

        story.is_breaking = (
            classification.is_breaking
        )


        if (
            classification.importance_score
            >= settings.min_importance_for_summary
        ):

            summary = summarize_story(
                title=story.title,
                content=content,
            )

            story.title = (
                summary.headline
            )

            story.summary = (
                summary.summary
            )

            story.why_it_matters = (
                summary.why_it_matters
            )

            db.commit()

            return "important"


        db.commit()

        return "classified"


    except Exception:

        db.rollback()

        logger.exception(
            "AI processing failed for story %s",
            story.id,
        )

        return "failed"