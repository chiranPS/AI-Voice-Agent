from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.faq_document import FAQDocument
from app.models.faq_category import FAQCategory
from app.models.faq_embedding import FAQEmbedding
from app.services.embedding_service import generate_query_embedding


def retrieve_relevant_faqs(
    db: Session,
    organisation_id,
    question: str,
    limit: int = 5,
):
    query_vector = generate_query_embedding(question)

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
            FAQDocument.organisation_id == organisation_id,
            FAQDocument.is_active.is_(True),
        )
        .order_by(distance)
        .limit(limit)
    )

    rows = db.execute(statement).all()

    results = []

    for faq, category_name, distance_value in rows:
        similarity = 1 - float(distance_value)

        results.append({
            "faq_id": faq.id,
            "question": faq.question,
            "answer": faq.answer,
            "category": category_name,
            "similarity": round(similarity, 4),
        })

    return results