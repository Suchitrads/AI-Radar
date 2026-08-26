from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImpactAnalysisResponse(BaseModel):
    id: int

    story_id: int
    project_id: int

    impact_score: float
    impact_level: str

    impact_type: str | None = None

    affected_technologies: str | None = None

    reason: str | None = None

    recommended_action: str | None = None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )