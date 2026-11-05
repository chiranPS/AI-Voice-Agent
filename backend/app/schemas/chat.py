import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    organisation_id: uuid.UUID
    session_id: uuid.UUID | None = None
    message: str = Field(min_length=2, max_length=2000)


class ChatSource(BaseModel):
    faq_id: uuid.UUID
    question: str
    category: str | None = None
    similarity: float


class ChatResponse(BaseModel):
    session_id: uuid.UUID
    answer: str
    sources: list[ChatSource]
    fallback: bool
    created_at: datetime