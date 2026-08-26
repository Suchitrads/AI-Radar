from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectTechnologyCreate(BaseModel):
    technology: str


class ProjectTopicCreate(BaseModel):
    topic: str


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

    frontend: str | None = None
    backend: str | None = None
    database: str | None = None
    infrastructure: str | None = None
    ai_stack: str | None = None

    technologies: list[str] = []
    topics: list[str] = []


class ProjectTechnologyResponse(BaseModel):
    id: int
    technology: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProjectTopicResponse(BaseModel):
    id: int
    topic: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProjectResponse(BaseModel):
    id: int

    name: str
    description: str | None

    frontend: str | None
    backend: str | None
    database: str | None
    infrastructure: str | None
    ai_stack: str | None

    technologies: list[ProjectTechnologyResponse] = []
    topics: list[ProjectTopicResponse] = []

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )