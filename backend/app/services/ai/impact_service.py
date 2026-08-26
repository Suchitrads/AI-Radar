from sqlalchemy.orm import Session

from app.models.impact import ImpactAnalysis
from app.models.project import Project
from app.models.story import Story

from app.services.ai.impact_analyzer import (
    analyze_impact,
)


def analyze_story_for_project(
    db: Session,
    project: Project,
    story: Story,
) -> ImpactAnalysis:

    result = analyze_impact(
        project=project,
        story=story,
    )

    existing = (
        db.query(ImpactAnalysis)
        .filter(
            ImpactAnalysis.project_id
            == project.id,
            ImpactAnalysis.story_id
            == story.id,
        )
        .first()
    )

    if existing:

        existing.impact_score = (
            result.impact_score
        )

        existing.impact_level = (
            result.impact_level
        )

        existing.impact_type = (
            result.impact_type
        )

        existing.affected_technologies = (
            ", ".join(
                result.affected_technologies
            )
        )

        existing.reason = result.reason

        existing.recommended_action = (
            result.recommended_action
        )

        db.commit()
        db.refresh(existing)

        return existing

    analysis = ImpactAnalysis(
        story_id=story.id,
        project_id=project.id,

        impact_score=result.impact_score,

        impact_level=result.impact_level,

        impact_type=result.impact_type,

        affected_technologies=", ".join(
            result.affected_technologies
        ),

        reason=result.reason,

        recommended_action=(
            result.recommended_action
        ),
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis