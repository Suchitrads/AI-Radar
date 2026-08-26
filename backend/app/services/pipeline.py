import logging

from sqlalchemy.orm import Session

from app.models.source import Source
from app.services.collector.service import collect_source
from app.services.ai.service import process_story
from app.models.story import Story


logger = logging.getLogger("ai_radar.pipeline")


def run_pipeline(
    db: Session,
    max_ai_stories: int = 10,
) -> dict:

    result = {
        "sources_scanned": 0,
        "stories_discovered": 0,
        "stories_stored": 0,
        "duplicates": 0,
        "ai_processed": 0,
        "important": 0,
        "classified": 0,
        "rejected": 0,
        "failed": 0,
    }

    # -------------------------
    # 1. COLLECT
    # -------------------------

    sources = (
        db.query(Source)
        .filter(Source.enabled.is_(True))
        .all()
    )

    result["sources_scanned"] = len(sources)

    for source in sources:

        scan_result = collect_source(
            db,
            source,
        )

        result["stories_discovered"] += (
            scan_result.get("discovered", 0)
        )

        result["stories_stored"] += (
            scan_result.get("stored", 0)
        )

        result["duplicates"] += (
            scan_result.get("duplicates", 0)
        )

    # -------------------------
    # 2. GEMINI PROCESSING
    # -------------------------

    stories = (
        db.query(Story)
        .filter(
            Story.importance_score.is_(None)
        )
        .order_by(
            Story.published_at.desc()
        )
        .limit(max_ai_stories)
        .all()
    )

    for story in stories:

        result["ai_processed"] += 1

        status = process_story(
            db,
            story,
        )

        if status == "important":
            result["important"] += 1

        elif status == "classified":
            result["classified"] += 1

        elif status == "rejected":
            result["rejected"] += 1

        elif status == "failed":
            result["failed"] += 1

    return result