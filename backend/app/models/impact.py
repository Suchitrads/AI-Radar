from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class ImpactAnalysis(Base):
    __tablename__ = "impact_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    story_id: Mapped[int] = mapped_column(
        ForeignKey("stories.id"),
        nullable=False,
        index=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    impact_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    impact_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    impact_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    affected_technologies: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    recommended_action: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    story = relationship(
        "Story",
        back_populates="impact_analyses",
    )

    project = relationship(
        "Project",
        back_populates="impact_analyses",
    )