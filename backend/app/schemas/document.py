import uuid

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organisation_id: uuid.UUID
    uploaded_by: uuid.UUID | None

    title: str
    description: str | None
    category: str | None

    file_name: str
    file_type: str
    file_size: int

    status: str

    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class DocumentUploadResponse(BaseModel):

    message: str
    document: DocumentResponse