from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    frontend: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    backend: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    database: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    infrastructure: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ai_stack: Mapped[str | None] = mapped_column(
        String(500),
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

    technologies = relationship(
        "ProjectTechnology",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    topics = relationship(
        "ProjectTopic",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    impact_analyses = relationship(
        "ImpactAnalysis",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectTechnology(Base):
    __tablename__ = "project_technologies"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    technology: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="technologies",
    )


class ProjectTopic(Base):
    __tablename__ = "project_topics"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    topic: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="topics",
    )