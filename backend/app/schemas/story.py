from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StoryBase(BaseModel):
    title: str
    url: str
    canonical_url: str

    original_title: str | None = None
    author: str | None = None

    raw_content: str | None = None
    clean_content: str | None = None

    published_at: datetime | None = None

    category: str | None = None
    sub_category: str | None = None

    companies: str | None = None
    technologies: str | None = None
    topics: str | None = None

    image_url: str | None = None


class StoryCreate(StoryBase):
    source_id: int


class StoryResponse(StoryBase):
    id: int
    source_id: int

    summary: str | None = None
    why_it_matters: str | None = None

    discovered_at: datetime

    importance_score: float | None = None
    novelty_score: float | None = None
    technical_score: float | None = None

    is_breaking: bool
    is_duplicate: bool
    duplicate_of: int | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)