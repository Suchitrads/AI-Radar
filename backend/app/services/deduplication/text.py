import re
import unicodedata


def normalize_title(title: str) -> str:
    """
    Normalize a title for similarity comparison.
    """

    title = unicodedata.normalize(
        "NFKC",
        title,
    )

    title = title.lower()

    title = re.sub(
        r"[^\w\s]",
        " ",
        title,
    )

    title = re.sub(
        r"\s+",
        " ",
        title,
    )

    return title.strip()