from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    source_id: Mapped[int] = mapped_column(
        ForeignKey("sources.id"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    original_title: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    url: Mapped[str] = mapped_column(
        String(2000),
        nullable=False,
    )

    canonical_url: Mapped[str] = mapped_column(
        String(2000),
        nullable=False,
        unique=True,
        index=True,
    )

    author: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    raw_content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    clean_content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    why_it_matters: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        index=True,
    )

    discovered_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    sub_category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    companies: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    technologies: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    topics: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    importance_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    novelty_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    technical_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    is_breaking: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_duplicate: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    duplicate_of: Mapped[int | None] = mapped_column(
        ForeignKey("stories.id"),
        nullable=True,
    )

    image_url: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    source = relationship(
        "Source",
        back_populates="stories",
    )

    interactions = relationship(
        "Interaction",
        back_populates="story",
        cascade="all, delete-orphan",
    )

    impact_analyses = relationship(
        "ImpactAnalysis",
        back_populates="story",
        cascade="all, delete-orphan",
    )