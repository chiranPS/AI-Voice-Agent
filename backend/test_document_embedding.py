from app.services.embedding_service import (
    generate_document_chunk_embedding,
)

from app.models.faq_embedding import EMBEDDING_DIMENSIONS


def test_document_embedding():

    title = "Student Handbook 2026"

    content = """
    Northstar University offers undergraduate programmes.
    Students must complete the registration process
    before beginning their academic programmes.
    """

    print("Generating document embedding...")

    embedding = generate_document_chunk_embedding(
        title=title,
        content=content,
    )

    print("\nEmbedding generated successfully!")

    print("Dimensions:", len(embedding))
    print("Expected dimensions:", EMBEDDING_DIMENSIONS)

    print("First five values:", embedding[:5])

    assert len(embedding) == EMBEDDING_DIMENSIONS

    print("\nEmbedding validation successful!")


if __name__ == "__main__":
    test_document_embedding()