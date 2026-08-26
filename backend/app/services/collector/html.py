import httpx
from bs4 import BeautifulSoup

from app.services.collector.base import CollectedArticle
from app.services.collector.extractor import (
    extract_article_text,
)


DEFAULT_TIMEOUT = 15.0


def collect_html(
    url: str,
) -> CollectedArticle:

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

        response = client.get(url)
        response.raise_for_status()

    html = response.text

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    title = ""

    if soup.title:
        title = soup.title.get_text(
            strip=True
        )

    content = extract_article_text(html)

    if not title:
        raise ValueError(
            "Unable to extract page title"
        )

    return CollectedArticle(
        title=title,
        original_title=title,
        url=str(response.url),
        content=content,
    )