from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.source import Source

from app.services.collector.service import (
    collect_source,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Collector"],
)


@router.post("/scan")
def run_scan(
    db: Session = Depends(get_db),
):

    sources = (
        db.query(Source)
        .filter(Source.enabled == True)
        .all()
    )

    results = []

    for source in sources:

        result = collect_source(
            db,
            source,
        )

        results.append(result)

    return {
        "sources_scanned": len(sources),
        "results": results,
    }