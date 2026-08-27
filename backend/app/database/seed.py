from sqlalchemy.orm import Session

from app.models.source import Source


DEFAULT_SOURCES = [
    {
        "name": "OpenAI",
        "website_url": "https://openai.com",
        "feed_url": "https://openai.com/news/rss.xml",
        "source_type": "rss",
        "category": "AI",
        "enabled": True,
        "priority": 10,
    },
]


def seed_sources(db: Session):
    for source_data in DEFAULT_SOURCES:

        existing = (
            db.query(Source)
            .filter(Source.name == source_data["name"])
            .first()
        )

        if existing:
            continue

        source = Source(**source_data)

        db.add(source)

    db.commit()