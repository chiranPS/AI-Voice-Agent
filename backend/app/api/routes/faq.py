import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.organization import Organisation
from app.models.faq_category import FAQCategory
from app.models.faq_document import FAQDocument
from app.models.faq_embedding import FAQEmbedding
from app.schemas.faq import (
    OrganisationCreate,
    OrganisationResponse,
    CategoryCreate,
    CategoryResponse,
    FAQCreate,
    FAQUpdate,
    FAQResponse,
)
from app.services.embedding_service import generate_document_embedding

router = APIRouter(tags=["University FAQ"])


@router.post(
    "/organisations",
    response_model=OrganisationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organisation(
    payload: OrganisationCreate,
    db: Session = Depends(get_db),
):
    organisation = Organisation(
        name=payload.name,
        slug=payload.slug,
    )

    db.add(organisation)

    try:
        db.commit()
        db.refresh(organisation)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An organisation with this slug already exists.",
        )

    return organisation


@router.get(
    "/organisations",
    response_model=list[OrganisationResponse],
)
def list_organisations(db: Session = Depends(get_db)):
    return db.scalars(
        select(Organisation).order_by(Organisation.name)
    ).all()


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
):
    organisation = db.get(Organisation, payload.organisation_id)

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found.")

    category = FAQCategory(
        organisation_id=payload.organisation_id,
        name=payload.name,
        description=payload.description,
    )

    db.add(category)

    try:
        db.commit()
        db.refresh(category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This category already exists for the organisation.",
        )

    return category


@router.get(
    "/categories/{organisation_id}",
    response_model=list[CategoryResponse],
)
def list_categories(
    organisation_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(FAQCategory)
        .where(FAQCategory.organisation_id == organisation_id)
        .order_by(FAQCategory.name)
    ).all()


@router.post(
    "/faqs",
    response_model=FAQResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
):
    organisation = db.get(Organisation, payload.organisation_id)

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found.")

    if payload.category_id:
        category = db.get(FAQCategory, payload.category_id)

        if not category or category.organisation_id != payload.organisation_id:
            raise HTTPException(
                status_code=400,
                detail="The selected category does not belong to this organisation.",
            )

    try:
        vector = generate_document_embedding(
            payload.question,
            payload.answer,
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate FAQ embedding: {error}",
        )

    faq = FAQDocument(
        organisation_id=payload.organisation_id,
        category_id=payload.category_id,
        question=payload.question,
        answer=payload.answer,
        is_active=payload.is_active,
    )

    try:
        db.add(faq)
        db.flush()

        embedding = FAQEmbedding(
            faq_id=faq.id,
            embedding=vector,
            model="gemini-embedding-2",
        )

        db.add(embedding)
        db.commit()
        db.refresh(faq)

    except Exception:
        db.rollback()
        raise

    return faq


@router.get(
    "/faqs/{organisation_id}",
    response_model=list[FAQResponse],
)
def list_faqs(
    organisation_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(FAQDocument)
        .where(FAQDocument.organisation_id == organisation_id)
        .options(joinedload(FAQDocument.embedding))
        .order_by(FAQDocument.created_at.desc())
    ).unique().all()


@router.get(
    "/faqs/detail/{faq_id}",
    response_model=FAQResponse,
)
def get_faq(
    faq_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    faq = db.get(FAQDocument, faq_id)

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found.")

    return faq


@router.put(
    "/faqs/{faq_id}",
    response_model=FAQResponse,
)
def update_faq(
    faq_id: uuid.UUID,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
):
    faq = db.get(FAQDocument, faq_id)

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found.")

    if payload.category_id:
        category = db.get(FAQCategory, payload.category_id)

        if not category or category.organisation_id != faq.organisation_id:
            raise HTTPException(
                status_code=400,
                detail="The selected category does not belong to this organisation.",
            )

    try:
        vector = generate_document_embedding(
            payload.question,
            payload.answer,
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not regenerate FAQ embedding: {error}",
        )

    faq.category_id = payload.category_id
    faq.question = payload.question
    faq.answer = payload.answer
    faq.is_active = payload.is_active

    embedding = db.get(FAQEmbedding, faq.id)

    if embedding:
        embedding.embedding = vector
        embedding.model = "gemini-embedding-2"
    else:
        embedding = FAQEmbedding(
            faq_id=faq.id,
            embedding=vector,
            model="gemini-embedding-2",
        )
        db.add(embedding)

    try:
        db.commit()
        db.refresh(faq)
    except Exception:
        db.rollback()
        raise

    return faq


@router.delete(
    "/faqs/{faq_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_faq(
    faq_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    faq = db.get(FAQDocument, faq_id)

    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found.")

    db.delete(faq)
    db.commit()

    return None