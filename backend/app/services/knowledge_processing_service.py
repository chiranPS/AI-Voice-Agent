import uuid

from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_document_chunk import KnowledgeDocumentChunk

from app.services.document_processing_service import (
    extract_document_text,
    chunk_extracted_content,
)

from app.services.embedding_service import (
    generate_document_chunk_embedding,
)


def process_knowledge_document(
    db: Session,
    organisation_id: uuid.UUID,
    document_id: uuid.UUID,
):
    # 1. Find the document within the administrator's organisation.

    document = (
        db.query(KnowledgeDocument)
        .filter(
            KnowledgeDocument.id == document_id,
            KnowledgeDocument.organisation_id == organisation_id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    if document.status not in ("uploaded", "failed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot process a document with status '{document.status}'.",
        )

    # 2. Mark the document as processing.

    document.status = "processing"
    db.commit()

    try:

        # 3. Extract text from the original file.

        extracted_sections = extract_document_text(
            file_path=document.file_path,
            file_type=document.file_type,
        )

        # 4. Split the extracted text into chunks.

        chunks = chunk_extracted_content(
            extracted_sections=extracted_sections,
            chunk_size=700,
            overlap=100,
        )

        if not chunks:
            raise ValueError(
                "Document processing produced no text chunks."
            )

        # 5. Generate embeddings for every chunk.

        prepared_chunks = []

        for chunk in chunks:

            embedding = generate_document_chunk_embedding(
                title=document.title,
                content=chunk["content"],
            )

            prepared_chunk = KnowledgeDocumentChunk(
                document_id=document.id,
                organisation_id=document.organisation_id,
                chunk_index=chunk["chunk_index"],
                page_number=chunk["page_number"],
                content=chunk["content"],
                embedding=embedding,
                embedding_model="gemini-embedding-2",

                # The current chunker counts words, not actual tokens.
                # Keep this NULL until a proper tokenizer is introduced.
                token_count=None,
            )

            prepared_chunks.append(prepared_chunk)

        # 6. Replace any previous chunks and save the new ones.
        # All changes below are committed together.

        db.query(KnowledgeDocumentChunk).filter(
            KnowledgeDocumentChunk.document_id == document.id
        ).delete(synchronize_session=False)

        db.add_all(prepared_chunks)

        # 7. Mark the document as successfully processed.

        document.status = "processed"

        db.commit()
        db.refresh(document)

        return {
            "document": document,
            "total_chunks": len(prepared_chunks),
            "total_pages": len(extracted_sections),
        }

    except Exception:

        db.rollback()

        # Mark the document as failed so it can be retried.

        failed_document = (
            db.query(KnowledgeDocument)
            .filter(
                KnowledgeDocument.id == document_id,
                KnowledgeDocument.organisation_id == organisation_id,
            )
            .first()
        )

        if failed_document:
            failed_document.status = "failed"
            db.commit()

        raise