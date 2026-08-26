from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.story import Story
from app.services.ai.service import (
    process_story,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Intelligence"],
)


@router.post("/intelligence")
def run_intelligence(
    limit: int = Query(
        default=5,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
):

    stories = (
        db.query(Story)
        .filter(
            Story.importance_score.is_(None)
        )
        .order_by(
            Story.published_at.desc()
        )
        .limit(limit)
        .all()
    )

    results = {
        "requested": limit,
        "processed": 0,
        "important": 0,
        "classified": 0,
        "rejected": 0,
        "failed": 0,
    }

    for story in stories:

        result = process_story(
            db,
            story,
        )

        results["processed"] += 1

        if result == "important":
            results["important"] += 1

        elif result == "classified":
            results["classified"] += 1

        elif result == "rejected":
            results["rejected"] += 1

        elif result == "failed":
            results["failed"] += 1

    return results