import trafilatura


def extract_article_text(
    html: str,
) -> str | None:

    extracted = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=False,
        favor_precision=True,
    )

    if not extracted:
        return None

    return extracted.strip()