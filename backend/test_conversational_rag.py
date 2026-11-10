
import sys
import uuid

sys.path.insert(0, ".")

from app.core.database import SessionLocal
from app.services.chat_service import process_chat_message


ORG_ID = uuid.UUID("c0e954d5-1e9f-4d10-8493-3553c873c204")

test_prompts = [
    "Hi, can you hear me? Who are you and what is your designation?",
    "What undergraduate computing degrees are offered at APIIT?",
    "What are its entry requirements after A/Levels?",
    "Can you explain that in simpler terms?",
]

db = SessionLocal()
session_id = None

try:
    print("=" * 60)
    print("  CONVERSATIONAL RAG TEST - APIIT COORDINATOR")
    print("=" * 60)

    for prompt in test_prompts:
        print(f"\n[USER]: {prompt}")

        res = process_chat_message(
            db=db,
            organisation_id=ORG_ID,
            session_id=session_id,
            user_message=prompt,
        )

        session_id = res["session_id"]

        print("\n[ASSISTANT]:")
        print(res["answer"])

        print(
            f"\n-> Sources Cited: {len(res['sources'])}"
            f" | Fallback: {res['fallback']}"
        )

        print("-" * 60)

finally:
    db.close()
