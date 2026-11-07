import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.routes.admin_auth import get_current_admin

from app.schemas.document import (
    DocumentResponse,
    DocumentUploadResponse,
    DocumentUpdateRequest,
)

from app.services.document_service import (
    upload_document,
    get_documents,
    get_document_by_id,
    delete_document,
    publish_document,
)
from app.services.knowledge_processing_service import (
    process_knowledge_document,
)

router = APIRouter(
    prefix="/documents",
    tags=["Knowledge Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    description: str | None = Form(None),
    category: str | None = Form(None),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document = await upload_document(
        db=db,
        organisation_id=current_admin.organisation_id,
        uploaded_by=current_admin.id,
        title=title,
        description=description,
        category=category,
        file=file,
    )

    return {
        "message": "Document uploaded successfully.",
        "document": document,
    }


@router.get(
    "/",
    response_model=list[DocumentResponse],
)
def list_documents(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return get_documents(
        db=db,
        organisation_id=current_admin.organisation_id,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def document_details(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document = get_document_by_id(
        db=db,
        organisation_id=current_admin.organisation_id,
        document_id=document_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document


@router.patch(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update_document_metadata(
    document_id: uuid.UUID,
    payload: DocumentUpdateRequest,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document = get_document_by_id(
        db=db,
        organisation_id=current_admin.organisation_id,
        document_id=document_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    if payload.title is not None and payload.title.strip():
        document.title = payload.title.strip()
    if payload.description is not None:
        document.description = payload.description.strip() if payload.description else None
    if payload.category is not None:
        document.category = payload.category.strip() if payload.category else None

    db.commit()
    db.refresh(document)

    return document


@router.post(
    "/{document_id}/process",
)
def process_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    result = process_knowledge_document(
        db=db,
        organisation_id=current_admin.organisation_id,
        document_id=document_id,
    )

    return {
        "message": "Document processed successfully.",
        "document": DocumentResponse.model_validate(
            result["document"]
        ),
        "total_chunks": result["total_chunks"],
        "total_pages": result["total_pages"],
    }


@router.post(
    "/{document_id}/publish",
)
def publish_knowledge_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document = get_document_by_id(
        db=db,
        organisation_id=current_admin.organisation_id,
        document_id=document_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    published_document = publish_document(
        db=db,
        document=document,
    )

    return {
        "message": "Document published successfully.",
        "document": DocumentResponse.model_validate(
            published_document
        ),
    }


@router.delete("/{document_id}")
def remove_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document = get_document_by_id(
        db=db,
        organisation_id=current_admin.organisation_id,
        document_id=document_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    delete_document(
        db=db,
        document=document,
    )

    return {
        "message": "Document deleted successfully."
    }
