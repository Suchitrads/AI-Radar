from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.source import Source
from app.schemas.source import (
    SourceCreate,
    SourceResponse,
    SourceUpdate,
)


router = APIRouter(
    prefix="/api/sources",
    tags=["Sources"],
)


@router.get(
    "",
    response_model=list[SourceResponse],
)
def get_sources(
    db: Session = Depends(get_db),
):
    return (
        db.query(Source)
        .order_by(Source.priority.desc(), Source.name.asc())
        .all()
    )


@router.get(
    "/{source_id}",
    response_model=SourceResponse,
)
def get_source(
    source_id: int,
    db: Session = Depends(get_db),
):
    source = (
        db.query(Source)
        .filter(Source.id == source_id)
        .first()
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source not found",
        )

    return source


@router.post(
    "",
    response_model=SourceResponse,
    status_code=201,
)
def create_source(
    source_data: SourceCreate,
    db: Session = Depends(get_db),
):
    source = Source(
        **source_data.model_dump()
    )

    db.add(source)
    db.commit()
    db.refresh(source)

    return source


@router.patch(
    "/{source_id}",
    response_model=SourceResponse,
)
def update_source(
    source_id: int,
    source_data: SourceUpdate,
    db: Session = Depends(get_db),
):
    source = (
        db.query(Source)
        .filter(Source.id == source_id)
        .first()
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source not found",
        )

    update_data = source_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)

    return source


@router.delete(
    "/{source_id}",
)
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
):
    source = (
        db.query(Source)
        .filter(Source.id == source_id)
        .first()
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source not found",
        )

    db.delete(source)
    db.commit()

    return {
        "message": "Source deleted successfully",
        "source_id": source_id,
    }