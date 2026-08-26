from datetime import datetime
from email.utils import parsedate_to_datetime

import feedparser
import httpx

from app.services.collector.base import CollectedArticle


DEFAULT_TIMEOUT = 15.0


def parse_date(entry) -> datetime | None:
    date_value = (
        entry.get("published")
        or entry.get("updated")
    )

    if not date_value:
        return None

    try:
        return parsedate_to_datetime(date_value)
    except (TypeError, ValueError):
        pass

    parsed = entry.get("published_parsed") or entry.get(
        "updated_parsed"
    )

    if parsed:
        try:
            return datetime(
                parsed.tm_year,
                parsed.tm_mon,
                parsed.tm_mday,
                parsed.tm_hour,
                parsed.tm_min,
                parsed.tm_sec,
            )
        except (TypeError, ValueError):
            return None

    return None


def collect_rss(
    feed_url: str,
) -> list[CollectedArticle]:

    headers = {
        "User-Agent": (
            "AI-RADAR/1.0 "
            "(AI intelligence research application)"
        )
    }

    with httpx.Client(
        timeout=DEFAULT_TIMEOUT,
        follow_redirects=True,
        headers=headers,
    ) as client:

        response = client.get(feed_url)
        response.raise_for_status()

    feed = feedparser.parse(response.content)

    if feed.bozo and not feed.entries:
        raise RuntimeError(
            "Unable to parse RSS/Atom feed"
        )

    articles: list[CollectedArticle] = []

    for entry in feed.entries:

        title = (
            entry.get("title")
            or ""
        ).strip()

        url = (
            entry.get("link")
            or ""
        ).strip()

        if not title or not url:
            continue

        content = None

        if entry.get("summary"):
            content = entry.get("summary")

        elif entry.get("description"):
            content = entry.get("description")

        author = entry.get("author")

        article = CollectedArticle(
            title=title,
            original_title=title,
            url=url,
            author=author,
            content=content,
            published_at=parse_date(entry),
        )

        articles.append(article)

    return articles