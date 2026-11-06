
import uuid

from app.core.database import SessionLocal

from app.services.document_retrieval_service import (
    retrieve_relevant_document_chunks,
)


ORGANISATION_ID = uuid.UUID(
    "c0e954d5-1e9f-4d10-8493-3553c873c204"
)


def main():

    db = SessionLocal()

    try:

        question = "What are the university tuition fees?"

        results = retrieve_relevant_document_chunks(
            db=db,
            organisation_id=ORGANISATION_ID,
            question=question,
            limit=5,
        )

        print("\nQuestion:", question)
        print("\nRetrieved document chunks:", len(results))

        for index, result in enumerate(results, start=1):

            print("\n------------------------------")
            print("Result:", index)
            print("Document:", result["document_title"])
            print("Page:", result["page_number"])
            print("Similarity:", result["similarity"])
            print("Content:")
            print(result["content"][:500])

    finally:
        db.close()


if __name__ == "__main__":
    main()
