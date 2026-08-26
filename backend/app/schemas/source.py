from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SourceBase(BaseModel):
    name: str
    website_url: str
    feed_url: str | None = None
    source_type: str
    category: str | None = None
    enabled: bool = True
    priority: int = 1


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    name: str | None = None
    website_url: str | None = None
    feed_url: str | None = None
    source_type: str | None = None
    category: str | None = None
    enabled: bool | None = None
    priority: int | None = None


class SourceResponse(SourceBase):
    id: int

    last_checked_at: datetime | None = None
    last_success_at: datetime | None = None
    last_failure_at: datetime | None = None
    failure_count: int

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)