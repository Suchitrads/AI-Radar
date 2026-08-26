from dataclasses import dataclass
from datetime import datetime


@dataclass
class CollectedArticle:
    title: str
    url: str

    original_title: str | None = None
    author: str | None = None

    content: str | None = None

    published_at: datetime | None = None

    image_url: str | None = None