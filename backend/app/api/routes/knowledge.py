import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.faq_document import FAQDocument
from app.models.faq_category import FAQCategory
from app.models.faq_embedding import FAQEmbedding
from app.schemas.faq import FAQSearchRequest, FAQSearchResponse, FAQSearchResult
from app.services.embedding_service import generate_query_embedding

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge Retrieval"],
)


@router.post("/search", response_model=FAQSearchResponse)
def search_knowledge(
    payload: FAQSearchRequest,
    db: Session = Depends(get_db),
):
    try:
        query_vector = generate_query_embedding(payload.question)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate search embedding: {error}",
        )

    distance = FAQEmbedding.embedding.cosine_distance(
        query_vector
    ).label("distance")

    statement = (
        select(FAQDocument, FAQCategory.name, distance)
        .join(
            FAQEmbedding,
            FAQEmbedding.faq_id == FAQDocument.id,
        )
        .outerjoin(
            FAQCategory,
            FAQCategory.id == FAQDocument.category_id,
        )
        .where(
            FAQDocument.organisation_id == payload.organisation_id,
            FAQDocument.is_active.is_(True),
        )
        .order_by(distance)
        .limit(payload.limit)
    )

    rows = db.execute(statement).all()

    results = []

    for faq, category_name, distance_value in rows:
        results.append(
            FAQSearchResult(
                faq_id=faq.id,
                question=faq.question,
                answer=faq.answer,
                category=category_name,
                similarity=round(1 - float(distance_value), 4),
            )
        )

    return FAQSearchResponse(results=results)