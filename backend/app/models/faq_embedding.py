import uuid
import os
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

EMBEDDING_DIMENSIONS = int(
    os.getenv("EMBEDDING_DIMENSIONS", "768")
)


class FAQEmbedding(Base):
    __tablename__ = "faq_embeddings"

    faq_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("faq_documents.id", ondelete="CASCADE"),
        primary_key=True,
    )

    embedding: Mapped[list[float]] = mapped_column(
        Vector(EMBEDDING_DIMENSIONS),
        nullable=False,
    )

    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    faq = relationship(
        "FAQDocument",
        back_populates="embedding",
    )