import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrganisationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9-]+$",
    )


class OrganisationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    created_at: datetime


class CategoryCreate(BaseModel):
    organisation_id: uuid.UUID
    name: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organisation_id: uuid.UUID
    name: str
    description: str | None
    created_at: datetime


class FAQCreate(BaseModel):
    organisation_id: uuid.UUID
    category_id: uuid.UUID | None = None
    question: str = Field(min_length=5, max_length=1000)
    answer: str = Field(min_length=2)
    is_active: bool = True


class FAQUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    question: str = Field(min_length=5, max_length=1000)
    answer: str = Field(min_length=2)
    is_active: bool = True


class FAQResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organisation_id: uuid.UUID
    category_id: uuid.UUID | None
    question: str
    answer: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FAQSearchRequest(BaseModel):
    organisation_id: uuid.UUID
    question: str = Field(min_length=2, max_length=1000)
    limit: int = Field(default=5, ge=1, le=10)


class FAQSearchResult(BaseModel):
    faq_id: uuid.UUID
    question: str
    answer: str
    category: str | None
    similarity: float


class FAQSearchResponse(BaseModel):
    results: list[FAQSearchResult]