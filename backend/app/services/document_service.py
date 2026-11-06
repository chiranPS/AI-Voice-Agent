import os
import uuid

from pathlib import Path
from datetime import datetime, timezone

from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_document_chunk import KnowledgeDocumentChunk


BACKEND_DIR = Path(__file__).resolve().parents[2]

STORAGE_DIR = Path(
    os.getenv(
        "DOCUMENT_STORAGE_PATH",
        "storage/documents",
    )
)

if not STORAGE_DIR.is_absolute():
    STORAGE_DIR = BACKEND_DIR / STORAGE_DIR

MAX_DOCUMENT_SIZE_MB = int(
    os.getenv("MAX_DOCUMENT_SIZE_MB", "20")
)

MAX_DOCUMENT_SIZE = MAX_DOCUMENT_SIZE_MB * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".txt": "txt",
}


async def upload_document(
    db: Session,
    organisation_id: uuid.UUID,
    uploaded_by: uuid.UUID,
    title: str,
    description: str | None,
    category: str | None,
    file: UploadFile,
):

    original_filename = Path(
        file.filename or ""
    ).name

    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOCX and TXT files are supported.",
        )

    if not title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document title is required.",
        )

    STORAGE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    stored_filename = f"{uuid.uuid4()}{extension}"

    file_path = STORAGE_DIR / stored_filename

    file_size = 0

    try:

        with file_path.open("wb") as destination:

            while True:

                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                file_size += len(chunk)

                if file_size > MAX_DOCUMENT_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Maximum file size is {MAX_DOCUMENT_SIZE_MB} MB.",
                    )

                destination.write(chunk)

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty.",
            )

        document = KnowledgeDocument(
            organisation_id=organisation_id,
            uploaded_by=uploaded_by,
            title=title.strip(),
            description=description.strip() if description else None,
            category=category.strip() if category else None,
            file_name=original_filename,
            stored_file_name=stored_filename,
            file_path=str(file_path.resolve()),
            file_type=ALLOWED_EXTENSIONS[extension],
            file_size=file_size,
            status="uploaded",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    except Exception:

        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise

    finally:
        await file.close()



def get_documents(
    db: Session,
    organisation_id: uuid.UUID,
):

    return (
        db.query(KnowledgeDocument)
        .filter(
            KnowledgeDocument.organisation_id == organisation_id
        )
        .order_by(
            KnowledgeDocument.created_at.desc()
        )
        .all()
    )


def get_document_by_id(
    db: Session,
    organisation_id: uuid.UUID,
    document_id: uuid.UUID,
):

    return (
        db.query(KnowledgeDocument)
        .filter(
            KnowledgeDocument.id == document_id,
            KnowledgeDocument.organisation_id == organisation_id,
        )
        .first()
    )


def publish_document(db: Session, document: KnowledgeDocument):

    if document.status != "processed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only successfully processed documents can be published.",
        )

    chunk_count = (
        db.query(KnowledgeDocumentChunk)
        .filter(
            KnowledgeDocumentChunk.document_id == document.id
        )
        .count()
    )

    if chunk_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish a document without processed content.",
        )

    document.status = "published"
    document.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(document)

    return document


def delete_document(
    db: Session,
    document: KnowledgeDocument,
):
    file_path = Path(document.file_path)

    try:
        db.delete(document)
        db.commit()

    except Exception:
        db.rollback()
        raise

    if file_path.exists():
        file_path.unlink()

    return True