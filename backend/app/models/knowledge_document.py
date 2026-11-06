import uuid

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    BigInteger,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
)

from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class KnowledgeDocument(Base):

    __tablename__ = "knowledge_documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    organisation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    uploaded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("admin_users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    category = Column(
        String(100),
        nullable=True,
    )

    file_name = Column(
        String(255),
        nullable=False,
    )

    stored_file_name = Column(
        String(255),
        nullable=False,
        unique=True,
    )

    file_path = Column(
        Text,
        nullable=False,
    )

    file_type = Column(
        String(20),
        nullable=False,
    )

    file_size = Column(
        BigInteger,
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="uploaded",
    )

    published_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('uploaded', 'processing', 'processed', 'published', 'failed', 'archived')",
            name="check_knowledge_document_status",
        ),
        CheckConstraint(
            "file_type IN ('pdf', 'docx', 'txt')",
            name="check_knowledge_document_file_type",
        ),
        CheckConstraint(
            "file_size > 0",
            name="check_knowledge_document_file_size",
        ),
        Index(
            "ix_knowledge_documents_org_status",
            "organisation_id",
            "status",
        ),
    )