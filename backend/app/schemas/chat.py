
import uuid
from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    organisation_id: uuid.UUID
    session_id: uuid.UUID | None = None
    message: str = Field(min_length=2, max_length=2000)


class FAQSource(BaseModel):
    type: Literal["faq"] = "faq"
    faq_id: uuid.UUID
    question: str
    category: str | None = None
    similarity: float


class DocumentSource(BaseModel):
    type: Literal["document"] = "document"
    document_id: uuid.UUID
    document_title: str
    chunk_id: uuid.UUID
    chunk_index: int
    page_number: int | None = None
    similarity: float


ChatSource = Annotated[
    Union[FAQSource, DocumentSource],
    Field(discriminator="type"),
]


class ChatResponse(BaseModel):
    session_id: uuid.UUID
    answer: str
    sources: list[ChatSource]
    fallback: bool
    created_at: datetime
