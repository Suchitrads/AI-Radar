from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.database.database import get_db
from app.schemas.voice import VoiceQueryRequest, VoiceQueryResponse
from app.services.ai.voice_service import process_voice_query

logger = logging.getLogger("ai_radar.api.voice")

router = APIRouter(
    prefix="/api/voice",
    tags=["Voice Assistant"],
)

@router.post(
    "/query",
    response_model=VoiceQueryResponse,
)
def voice_query(
    request_data: VoiceQueryRequest,
    db: Session = Depends(get_db),
):
    try:
        result = process_voice_query(
            db=db,
            query=request_data.query,
            project_id=request_data.project_id,
            story_id=request_data.story_id,
        )
        return result
    except Exception as e:
        logger.exception("Error processing voice query")
        raise HTTPException(
            status_code=500,
            detail="AI RADAR couldn't process your request. Please try again.",
        )
