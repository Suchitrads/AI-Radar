from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.pipeline import run_pipeline


router = APIRouter(
    prefix="/api/admin",
    tags=["Pipeline"],
)


@router.post("/pipeline")
def execute_pipeline(
    max_ai_stories: int = Query(
        default=10,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
):

    return run_pipeline(
        db=db,
        max_ai_stories=max_ai_stories,
    )