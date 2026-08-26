from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.source import Source
from app.models.story import Story
from app.schemas.story import (
    StoryCreate,
    StoryResponse,
)


router = APIRouter(
    prefix="/api/stories",
    tags=["Stories"],
)


@router.get(
    "",
    response_model=list[StoryResponse],
)
def get_stories(
    db: Session = Depends(get_db),
):
    return (
        db.query(Story)
        .order_by(
            Story.published_at.desc(),
            Story.created_at.desc(),
        )
        .all()
    )


@router.get(
    "/{story_id}",
    response_model=StoryResponse,
)
def get_story(
    story_id: int,
    db: Session = Depends(get_db),
):
    story = (
        db.query(Story)
        .filter(Story.id == story_id)
        .first()
    )

    if not story:
        raise HTTPException(
            status_code=404,
            detail="Story not found",
        )

    return story


@router.post(
    "",
    response_model=StoryResponse,
    status_code=201,
)
def create_story(
    story_data: StoryCreate,
    db: Session = Depends(get_db),
):
    source = (
        db.query(Source)
        .filter(Source.id == story_data.source_id)
        .first()
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source not found",
        )

    existing_story = (
        db.query(Story)
        .filter(
            Story.canonical_url
            == story_data.canonical_url
        )
        .first()
    )

    if existing_story:
        raise HTTPException(
            status_code=409,
            detail="Story with this canonical URL already exists",
        )

    story = Story(
        **story_data.model_dump()
    )

    db.add(story)
    db.commit()
    db.refresh(story)

    return story