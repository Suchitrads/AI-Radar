from datetime import datetime, timedelta, timezone

from rapidfuzz.fuzz import ratio
from sqlalchemy.orm import Session

from app.models.source import Source
from app.models.story import Story

from app.services.deduplication.text import (
    normalize_title,
)
from app.services.deduplication.url import (
    canonicalize_url,
)


TITLE_SIMILARITY_THRESHOLD = 88

TIME_WINDOW_HOURS = 48


def normalize_list(value: str | None) -> set[str]:
    if not value:
        return set()

    return {
        item.strip().lower()
        for item in value.split(",")
        if item.strip()
    }


def context_overlap(
    first: Story,
    second: Story,
) -> float:

    first_topics = normalize_list(
        first.topics
    )

    second_topics = normalize_list(
        second.topics
    )

    first_companies = normalize_list(
        first.companies
    )

    second_companies = normalize_list(
        second.companies
    )

    topic_overlap = bool(
        first_topics & second_topics
    )

    company_overlap = bool(
        first_companies & second_companies
    )

    if topic_overlap and company_overlap:
        return 1.0

    if topic_overlap or company_overlap:
        return 0.5

    return 0.0


def publication_close(
    first: Story,
    second: Story,
) -> bool:

    if not first.published_at:
        return False

    if not second.published_at:
        return False

    first_time = first.published_at
    second_time = second.published_at

    if first_time.tzinfo is None:
        first_time = first_time.replace(
            tzinfo=timezone.utc
        )

    if second_time.tzinfo is None:
        second_time = second_time.replace(
            tzinfo=timezone.utc
        )

    difference = abs(
        first_time - second_time
    )

    return difference <= timedelta(
        hours=TIME_WINDOW_HOURS
    )


def find_exact_duplicate(
    db: Session,
    canonical_url: str,
) -> Story | None:

    return (
        db.query(Story)
        .filter(
            Story.canonical_url
            == canonical_url
        )
        .first()
    )


def find_fuzzy_duplicate(
    db: Session,
    story: Story,
) -> Story | None:

    if not story.title:
        return None

    normalized_title = normalize_title(
        story.title
    )

    # Only inspect relatively recent stories.
    candidates = (
        db.query(Story)
        .filter(
            Story.id != story.id
        )
        .order_by(
            Story.published_at.desc()
        )
        .limit(200)
        .all()
    )

    best_candidate = None
    best_score = 0.0

    for candidate in candidates:

        if not candidate.title:
            continue

        candidate_title = normalize_title(
            candidate.title
        )

        title_score = ratio(
            normalized_title,
            candidate_title,
        )

        if title_score < TITLE_SIMILARITY_THRESHOLD:
            continue

        time_match = publication_close(
            story,
            candidate,
        )

        context_score = context_overlap(
            story,
            candidate,
        )

        # A fuzzy title alone is NOT sufficient.
        if not time_match and context_score == 0:
            continue

        final_score = (
            title_score * 0.70
            + (100 if time_match else 0) * 0.15
            + (context_score * 100) * 0.15
        )

        if final_score > best_score:
            best_score = final_score
            best_candidate = candidate

    return best_candidate


def is_duplicate(
    db: Session,
    story: Story,
) -> tuple[bool, Story | None]:

    canonical_url = canonicalize_url(
        story.url
    )

    story.canonical_url = canonical_url

    exact_match = find_exact_duplicate(
        db,
        canonical_url,
    )

    if exact_match and exact_match.id != story.id:
        return True, exact_match

    fuzzy_match = find_fuzzy_duplicate(
        db,
        story,
    )

    if fuzzy_match:
        return True, fuzzy_match

    return False, None