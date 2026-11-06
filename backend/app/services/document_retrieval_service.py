
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_document_chunk import KnowledgeDocumentChunk

from app.services.embedding_service import generate_query_embedding


def retrieve_relevant_document_chunks(
    db: Session,
    organisation_id,
    question: str,
    limit: int = 5,
):
    """
    Retrieve relevant chunks from published university documents.

    Only documents belonging to the requested organisation
    with published status are included.
    """

    query_vector = generate_query_embedding(question)

    distance = (
        KnowledgeDocumentChunk.embedding
        .cosine_distance(query_vector)
        .label("distance")
    )

    statement = (
        select(
            KnowledgeDocumentChunk,
            KnowledgeDocument.title,
            distance,
        )
        .join(
            KnowledgeDocument,
            KnowledgeDocument.id
            == KnowledgeDocumentChunk.document_id,
        )
        .where(
            KnowledgeDocumentChunk.organisation_id
            == organisation_id,

            KnowledgeDocument.organisation_id
            == organisation_id,

            KnowledgeDocument.status == "published",
        )
        .order_by(distance)
        .limit(limit)
    )

    rows = db.execute(statement).all()

    results = []

    for chunk, document_title, distance_value in rows:

        similarity = 1 - float(distance_value)

        results.append({
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "document_title": document_title,
            "chunk_index": chunk.chunk_index,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "similarity": round(similarity, 4),
        })

    return results
