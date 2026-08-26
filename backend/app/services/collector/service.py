import logging
from unittest import result
from unittest import result

from sqlalchemy.orm import Session

from app.models.source import Source
from app.models.story import Story

from app.services.collector.base import (
    CollectedArticle,
)
from app.services.collector.rss import (
    collect_rss,
)

from app.services.deduplication.service import (
    is_duplicate,
)
from app.services.deduplication.url import (
    canonicalize_url,
)

logger = logging.getLogger("ai_radar.collector")


def save_article(
    db: Session,
    source: Source,
    article: CollectedArticle,
) -> str:

    canonical_url = canonicalize_url(
        article.url
    )

    story = Story(
        source_id=source.id,

        title=article.title,
        original_title=article.original_title,

        url=article.url,
        canonical_url=canonical_url,

        author=article.author,

        raw_content=article.content,
        clean_content=article.content,

        published_at=article.published_at,

        image_url=article.image_url,
    )

    duplicate, existing_story = is_duplicate(
        db,
        story,
    )

    if duplicate:
        return "duplicate"

    db.add(story)

    return "stored"

def collect_source(
    db: Session,
    source: Source,
) -> dict:

    if not source.feed_url:

        return {
            "source": source.name,
            "status": "skipped",
            "reason": "No feed URL configured",
            "discovered": 0,
            "stored": 0,
            "duplicates": 0,
        }

    discovered = 0
    stored = 0
    duplicates = 0

    try:

        articles = collect_rss(
            source.feed_url
        )

        discovered = len(articles)

        for article in articles:

            result = save_article(
                db,
                source,
                article,
            )

            if result == "stored":
                stored += 1

            elif result == "duplicate":
                 duplicates += 1

        db.commit()

        return {
            "source": source.name,
            "status": "success",
            "discovered": discovered,
            "stored": stored,
            "duplicates": duplicates,
        }

    except Exception as exc:

        db.rollback()

        logger.exception(
            "Collection failed for %s",
            source.name,
        )

        return {
            "source": source.name,
            "status": "failed",
            "error": str(exc),
            "discovered": discovered,
            "stored": stored,
            "duplicates": duplicates,
        }