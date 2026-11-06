import uuid

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    Text,
    String,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
)

from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class KnowledgeDocumentChunk(Base):

    __tablename__ = "knowledge_document_chunks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "knowledge_documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    organisation_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "organisations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    chunk_index = Column(
        Integer,
        nullable=False,
    )

    page_number = Column(
        Integer,
        nullable=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    embedding = Column(
        Vector(768),
        nullable=False,
    )

    embedding_model = Column(
        String(100),
        nullable=False,
    )

    token_count = Column(
        Integer,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "document_id",
            "chunk_index",
            name="uq_knowledge_document_chunk_index",
        ),

        CheckConstraint(
            "chunk_index >= 0",
            name="check_knowledge_chunk_index",
        ),

        Index(
            "ix_knowledge_chunks_org_document",
            "organisation_id",
            "document_id",
        ),
    )