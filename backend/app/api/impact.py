from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.impact import ImpactAnalysis
from app.models.project import Project
from app.models.story import Story
from app.services.ai.impact_service import analyze_story_for_project

router = APIRouter(
    prefix="/api/projects",
    tags=["Impact Radar"],
)


@router.get(
    "/{project_id}/impact",
)
def get_project_impact(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    analyses = (
        db.query(ImpactAnalysis)
        .filter(
            ImpactAnalysis.project_id
            == project_id
        )
        .order_by(
            ImpactAnalysis.impact_score.desc()
        )
        .all()
    )

    return {
        "project": {
            "id": project.id,
            "name": project.name,
        },
        "impact_count": len(analyses),
        "impacts": analyses,
    }

@router.post(
    "/{project_id}/impact/analyze/{story_id}"
)
def analyze_project_impact(
    project_id: int,
    story_id: int,
    db: Session = Depends(get_db),
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

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

    analysis = analyze_story_for_project(
        db=db,
        project=project,
        story=story,
    )

    return analysis