from pydantic import BaseModel, Field


class ClassificationResult(BaseModel):
    is_ai_related: bool = Field(
        description="Whether the story is meaningfully related to artificial intelligence."
    )

    category: str = Field(
        description="Main AI category such as AI Agents, Models, Research, Infrastructure, Robotics, Security, Regulation, Developer Tools, Open Source, or Business."
    )

    sub_category: str = Field(
        description="More specific subcategory."
    )

    companies: list[str] = Field(
        default_factory=list,
        description="Important companies, organizations, labs, or projects mentioned."
    )

    technologies: list[str] = Field(
        default_factory=list,
        description="Important technologies, APIs, SDKs, models, frameworks, or tools."
    )

    topics: list[str] = Field(
        default_factory=list,
        description="Useful topic tags for personalization."
    )

    importance_score: float = Field(
        ge=0,
        le=10,
        description="Overall importance from 0 to 10."
    )

    novelty_score: float = Field(
        ge=0,
        le=10,
        description="How new or distinctive the development is, from 0 to 10."
    )

    technical_score: float = Field(
        ge=0,
        le=10,
        description="Technical significance from 0 to 10."
    )

    is_breaking: bool = Field(
        description="Whether this is a breaking or unusually time-sensitive development."
    )


class SummaryResult(BaseModel):
    headline: str = Field(
        description="Concise headline, approximately 15 words maximum."
    )

    summary: str = Field(
        description="One to three concise sentences."
    )

    why_it_matters: str = Field(
        description="One strong sentence explaining practical significance."
    )

class ImpactResult(BaseModel):
    impact_score: float = Field(
        ge=0,
        le=10,
        description="How strongly this AI update affects the project, from 0 to 10."
    )

    impact_level: str = Field(
        description="LOW, MEDIUM, HIGH, or CRITICAL."
    )

    impact_type: str = Field(
        description="Type of impact such as technology, dependency, security, cost, capability, or opportunity."
    )

    affected_technologies: list[str] = Field(
        default_factory=list,
        description="Project technologies affected by the update."
    )

    reason: str = Field(
        description="Concise explanation of why the update affects the project."
    )

    recommended_action: str = Field(
        description="Practical action the project owner should consider."
    )