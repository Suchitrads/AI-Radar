from pydantic import BaseModel, ConfigDict
from typing import Optional, Any

class VoiceQueryRequest(BaseModel):
    query: str
    project_id: Optional[int] = None
    story_id: Optional[int] = None

class VoiceQueryResponse(BaseModel):
    query: str
    intent: str
    answer: str
    data: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
