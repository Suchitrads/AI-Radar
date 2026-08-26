from urllib.parse import (
    parse_qsl,
    urlencode,
    urlsplit,
    urlunsplit,
)


TRACKING_PARAMETERS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "gclid",
    "fbclid",
    "mc_cid",
    "mc_eid",
}


def canonicalize_url(url: str) -> str:
    """
    Normalize a URL so tracking parameters and
    unnecessary formatting differences do not create
    duplicate stories.
    """

    url = url.strip()

    parts = urlsplit(url)

    scheme = parts.scheme.lower()
    hostname = (parts.hostname or "").lower()

    # Remove default ports
    netloc = hostname

    if parts.port:
        if not (
            (scheme == "http" and parts.port == 80)
            or
            (scheme == "https" and parts.port == 443)
        ):
            netloc = f"{hostname}:{parts.port}"

    # Remove tracking query parameters
    query_items = parse_qsl(
        parts.query,
        keep_blank_values=True,
    )

    filtered_query = [
        (key, value)
        for key, value in query_items
        if key.lower() not in TRACKING_PARAMETERS
    ]

    query = urlencode(
        filtered_query,
        doseq=True,
    )

    path = parts.path.rstrip("/")

    return urlunsplit(
        (
            scheme,
            netloc,
            path,
            query,
            "",
        )
    )