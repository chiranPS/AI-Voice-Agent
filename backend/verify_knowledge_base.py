"""
APIIT Sri Lanka Knowledge Base Diagnostic & Retrieval Verification
File: backend/verify_knowledge_base.py
"""

import sys
import uuid
from pathlib import Path

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import SessionLocal
from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_document_chunk import KnowledgeDocumentChunk
from app.models.organization import Organisation
from app.services.document_retrieval_service import retrieve_relevant_document_chunks

ORGANISATION_ID = uuid.UUID("c0e954d5-1e9f-4d10-8493-3553c873c204")

BENCHMARK_QUERIES = [
    {
        "domain": "Computing Programmes",
        "query": "What computing degrees are offered with Staffordshire University and what are the specialisms?",
    },
    {
        "domain": "Business Programmes",
        "query": "Tell me about the Business Management and Accounting degrees offered at APIIT.",
    },
    {
        "domain": "Entry Pathways",
        "query": "What are the entry requirements for undergraduate degrees after A/Levels or O/Levels?",
    },
    {
        "domain": "Tuition Fees",
        "query": "What are the tuition fees and payment instalment options for degree programmes?",
    },
    {
        "domain": "Employability & Career",
        "query": "What are the industry placement opportunities and graduate employment rates at APIIT?",
    },
    {
        "domain": "Student Life & Facilities",
        "query": "Where is the APIIT City Campus located and what student support facilities exist?",
    },
]


def check_knowledge_base_health():
    db = SessionLocal()
    try:
        print("\n=======================================================")
        print("  APIIT SRI LANKA KNOWLEDGE BASE DIAGNOSTIC REPORT")
        print("=======================================================")

        # 1. Verify Organisation
        org = db.query(Organisation).filter(Organisation.id == ORGANISATION_ID).first()
        if not org:
            print("[-] ERROR: Target organisation UUID not found in database!")
            return

        print(f"[+] Organisation: {org.name} ({org.slug})")

        # 2. List Knowledge Documents
        documents = (
            db.query(KnowledgeDocument)
            .filter(KnowledgeDocument.organisation_id == ORGANISATION_ID)
            .order_by(KnowledgeDocument.created_at.asc())
            .all()
        )

        print(f"\n[+] Total Uploaded Documents: {len(documents)}")
        if len(documents) == 0:
            print("[-] No documents uploaded yet. Please upload the 8 PDF documents via Knowledge Hub.")
            return

        print("\n--- Document Inventory ---")
        published_count = 0
        for idx, doc in enumerate(documents, start=1):
            chunk_count = (
                db.query(KnowledgeDocumentChunk)
                .filter(KnowledgeDocumentChunk.document_id == doc.id)
                .count()
            )
            is_published = doc.status == "published"
            if is_published:
                published_count += 1
            status_symbol = "[OK]" if is_published else "[!]"
            print(
                f"{status_symbol} #{idx}: {doc.title:<45} | Category: {doc.category or 'General'} | "
                f"Status: {doc.status:<10} | Chunks: {chunk_count}"
            )

        print(f"\n[+] Published Documents: {published_count}/{len(documents)}")

        total_chunks = (
            db.query(KnowledgeDocumentChunk)
            .filter(KnowledgeDocumentChunk.organisation_id == ORGANISATION_ID)
            .count()
        )
        print(f"[+] Total Vectorized Chunks in pgvector: {total_chunks}")

        if published_count == 0:
            print("\n[-] WARNING: No documents are in 'published' status. Chunks cannot be retrieved by RAG.")
            print("    Please click 'Publish' for each processed document in the Knowledge Hub.")
            return

        # 3. Benchmark Retrieval Test
        print("\n=======================================================")
        print("  BENCHMARK SIMILARITY RETRIEVAL TEST")
        print("=======================================================")

        for idx, test in enumerate(BENCHMARK_QUERIES, start=1):
            print(f"\nTest {idx} [{test['domain']}]: '{test['query']}'")
            results = retrieve_relevant_document_chunks(
                db=db,
                organisation_id=ORGANISATION_ID,
                question=test["query"],
                limit=3,
            )

            if not results:
                print("  [-] No chunks retrieved!")
                continue

            top = results[0]
            print(f"  [+] Top Match: '{top['document_title']}' (Page {top['page_number']})")
            print(f"      Similarity Score: {top['similarity']} (Threshold: 0.45)")
            print(f"      Snippet: {top['content'][:180].strip()}...")

            if top["similarity"] >= 0.45:
                print("      Status: PASSED (Sufficient for RAG generation)")
            else:
                print("      Status: WEAK (Below 0.45 threshold)")

        print("\n=======================================================")
        print("  DIAGNOSTIC TEST COMPLETE")
        print("=======================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    check_knowledge_base_health()