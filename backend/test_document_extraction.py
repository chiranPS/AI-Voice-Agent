from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.knowledge_document import KnowledgeDocument

from app.services.document_processing_service import (
    extract_document_text,
    chunk_extracted_content,
)


DOCUMENT_ID = "d38c0031-b00f-4778-97d4-d2082f391724"


def test_document_extraction():

    db: Session = SessionLocal()

    try:

        document = (
            db.query(KnowledgeDocument)
            .filter(
                KnowledgeDocument.id == DOCUMENT_ID
            )
            .first()
        )

        if not document:
            print("Document not found.")
            return

        print("\nDocument:", document.title)
        print("File:", document.file_name)
        print("Type:", document.file_type)

        extracted_pages = extract_document_text(
            file_path=document.file_path,
            file_type=document.file_type,
        )

        chunks = chunk_extracted_content(
            extracted_sections=extracted_pages,
            chunk_size=700,
            overlap=100,
        )

        print("\n========== CHUNKING RESULTS ==========")

        print("Total chunks:", len(chunks))

        for chunk in chunks:

            print("\n------------------------------")

            print("Chunk index:", chunk["chunk_index"])
            print("Starting page:", chunk["page_number"])
            print("Word count:", chunk["token_count"])

            print("\nContent preview:")
            print(chunk["content"][:300])

        print("\n======================================")

        print("\nExtraction successful!")
        print("Extracted sections:", len(extracted_pages))

        for section in extracted_pages:

            print("\n------------------------------")

            print("Page:", section["page_number"])

            print("Characters:", len(section["content"]))

            print("\nContent preview:")

            print(section["content"][:500])

        total_characters = sum(
            len(section["content"])
            for section in extracted_pages
        )

        print("\n------------------------------")
        print("Total extracted characters:", total_characters)

    except Exception as error:

        print("Extraction failed:", str(error))
        raise

    finally:
        db.close()


if __name__ == "__main__":
    test_document_extraction()