from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.project import (
    Project,
    ProjectTechnology,
    ProjectTopic,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
)


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
):
    return (
        db.query(Project)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
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

    return project


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=201,
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
):
    project = Project(
        name=project_data.name,
        description=project_data.description,

        frontend=project_data.frontend,
        backend=project_data.backend,
        database=project_data.database,
        infrastructure=project_data.infrastructure,
        ai_stack=project_data.ai_stack,
    )

    db.add(project)
    db.flush()

    for technology in project_data.technologies:
        project.technologies.append(
            ProjectTechnology(
                technology=technology.strip()
            )
        )

    for topic in project_data.topics:
        project.topics.append(
            ProjectTopic(
                topic=topic.strip()
            )
        )

    db.commit()
    db.refresh(project)

    return project