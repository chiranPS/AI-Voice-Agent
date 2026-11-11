"""
AI Admissions and Marketing Coordinator Chat Service
Institution: Asia Pacific Institute of Information Technology (APIIT) Sri Lanka
File: backend/app/services/chat_service.py
"""

import logging
import os
import uuid
import base64
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.conversation_message import ConversationMessage
from app.models.conversation_session import ConversationSession
from app.models.organization import Organisation
from app.models.university_contact import UniversityContact
from app.services.document_retrieval_service import (
    retrieve_relevant_document_chunks,
)
from app.services.knowledge_service import retrieve_relevant_faqs
from app.services.prompts.coordinator_prompt import (
    COORDINATOR_SYSTEM_INSTRUCTION,
)

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

DOCUMENT_MIN_SIMILARITY = float(
    os.getenv("DOCUMENT_RAG_MIN_SIMILARITY", "0.45")
)
FAQ_MIN_SIMILARITY = float(
    os.getenv("RAG_MIN_SIMILARITY", "0.45")
)

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured in backend/.env")

client = genai.Client(api_key=API_KEY)

system_instruction = COORDINATOR_SYSTEM_INSTRUCTION


def create_gemini_history(messages: list[ConversationMessage]) -> list[types.Content]:
    """Convert DB conversation messages into Gemini Content objects."""
    history = []
    for message in messages:
        role = "user" if message.role == "user" else "model"
        history.append(
            types.Content(
                role=role,
                parts=[types.Part(text=message.content)],
            )
        )
    return history


def is_conversational_meta_query(question: str) -> bool:
    """
    Detect if the user message is an everyday greeting, role check,
    audio test, or clarification request that should be handled
    via conversational intelligence without demanding strict RAG matches.
    """
    q = question.strip().lower()

    # Exact or near-exact short greetings
    greetings = {
        "hi", "hello", "hey", "good morning", "good afternoon",
        "good evening", "how are you", "how are you doing",
        "how's it going", "how r u", "hi there", "hello there",
    }
    if q in greetings or any(q.startswith(g + " ") for g in ["hi", "hello", "hey"]):
        return True

    # Audio/connection checks
    audio_checks = [
        "can you hear me", "are you there", "hello can you hear me",
        "can you speak", "testing", "mic check", "is this working",
    ]
    if any(phrase in q for phrase in audio_checks):
        return True

    # Identity and role queries
    identity_checks = [
        "who are you", "what is your name", "what are you",
        "what is your role", "what do you do", "which department",
        "what is your designation", "are you a robot", "are you an ai",
        "are you a real person", "are you human", "what can you help me with",
        "what can you do", "tell me about yourself",
    ]
    if any(phrase in q for phrase in identity_checks):
        return True

    # Clarifications and rephrasing
    clarification_checks = [
        "explain that again", "can you explain that again",
        "i don't understand", "i do not understand", "explain differently",
        "explain it differently", "simplify that", "what do you mean",
        "can you rephrase", "rephrase that", "tell me more simply",
    ]
    if any(phrase in q for phrase in clarification_checks):
        return True

    return False


def contextualize_user_query(
    user_message: str,
    history: list[ConversationMessage],
) -> str:
    """
    Resolve ambiguous pronouns ('it', 'that course', 'its fee', 'the entry requirements')
    using recent conversation history to produce a high-precision search query for pgvector.
    """
    if not history or is_conversational_meta_query(user_message):
        return user_message

    # Quick check if user message is short and pronoun-dependent
    pronoun_markers = ["it", "this", "that", "these", "those", "its", "the course", "the degree", "the programme"]
    words = user_message.lower().split()
    has_pronoun = any(p in words for p in pronoun_markers)

    if not has_pronoun and len(words) > 6:
        return user_message

    # Use Gemini to generate a standalone search query if context is needed
    try:
        last_turns = history[-4:]
        history_summary = "\n".join(
            f"{msg.role.upper()}: {msg.content[:200]}" for msg in last_turns
        )

        prompt = f"""
Given the following conversation history and a user follow-up question, rewrite the question into a clear, standalone search query that includes the specific academic programme or topic being discussed.
Do not answer the question. Only output the reformulated query in one line. If no rewrite is needed, return the original question.

Conversation History:
{history_summary}

User Follow-Up Question:
{user_message}

Standalone Search Query:
"""
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,
                max_output_tokens=60,
            ),
        )
        reformulated = (response.text or "").strip()
        if reformulated and len(reformulated) > 3:
            logger.info("Contextualized query: '%s' -> '%s'", user_message, reformulated)
            return reformulated
    except Exception as exc:
        logger.warning("Query contextualization skipped due to: %s", exc)

    return user_message


def is_contact_question(question: str) -> bool:
    """Identify if the user is asking for contact or location details."""
    contact_keywords = [
        "contact", "phone", "telephone", "number", "call", "email",
        "address", "location", "where is", "how to reach", "hotline",
        "office hours", "campus location", "union place", "colombo campus",
    ]
    q_lower = question.lower()
    return any(k in q_lower for k in contact_keywords)


def retrieve_relevant_contacts(
    db: Session,
    organisation_id: uuid.UUID,
    question: str,
) -> list[UniversityContact]:
    """Retrieve active APIIT contact records based on matching department keywords."""
    if not is_contact_question(question):
        return []

    contacts = db.scalars(
        select(UniversityContact)
        .where(
            UniversityContact.organisation_id == organisation_id,
            UniversityContact.is_active.is_(True),
        )
        .order_by(UniversityContact.department)
    ).all()

    if not contacts:
        return []

    q_lower = question.lower()
    department_aliases = {
        "Admissions & Marketing Office": ["admission", "admissions", "apply", "enroll", "marketing", "intake"],
        "School of Computing & Technology": ["computing", "software", "computer", "cyber", "it", "technology"],
        "APIIT Business School": ["business", "management", "accounting", "finance", "hrm"],
        "Student Services & Career Guidance": ["student services", "career", "placement", "counseling", "internship"],
        "IT Services & Technical Support": ["it support", "technical", "lab", "computer centre"],
        "General Enquiries Hotline": ["general", "hotline", "reception", "phone", "call", "enquiry"],
    }

    matching = []
    for contact in contacts:
        aliases = department_aliases.get(contact.department, [])
        if any(alias in q_lower for alias in aliases):
            matching.append(contact)

    return matching if matching else list(contacts[:3])


def build_document_context(document_results: list[dict]) -> str:
    """Format retrieved document chunks for the LLM."""
    if not document_results:
        return ""
    sections = []
    for index, doc in enumerate(document_results, start=1):
        sections.append(
            f"""
[DOCUMENT EXCERPT {index}]
Document Title: {doc['document_title']}
Page Number: {doc.get('page_number') or 'General'}
Relevance Similarity: {doc.get('similarity', 'N/A')}
Content:
{doc['content']}
"""
        )
    return "\n".join(sections)


def build_contact_context(contact_results: list[UniversityContact]) -> str:
    """Format retrieved contact details for the LLM."""
    if not contact_results:
        return ""
    sections = []
    for index, contact in enumerate(contact_results, start=1):
        sections.append(
            f"""
[CONTACT RECORD {index}]
Department: {contact.department}
Phone Number: {contact.phone_number}
Email Address: {contact.email or 'Not available'}
Office Location: {contact.office_location or 'APIIT City Campus, Colombo 02'}
Office Hours: {contact.office_hours or 'Monday - Friday, 8:30 AM - 5:00 PM'}
"""
        )
    return "\n".join(sections)


def generate_coordinator_response(
    question: str,
    history: list[ConversationMessage],
    document_results: list[dict],
    faq_results: list[dict],
    contact_results: list[UniversityContact],
    is_conversational_turn: bool,
) -> str:
    """
    Generate an intelligent, human-like response using Gemini
    governed by the APIIT AI Admissions & Marketing Coordinator persona.
    """
    doc_context = build_document_context(document_results)
    contact_context = build_contact_context(contact_results)

    # Dynamic user prompt constructed with verified context
    user_prompt_parts = [
        f"Prospective Student / Visitor Statement:\n{question}\n"
    ]

    if doc_context:
        user_prompt_parts.append(
            f"<apiit_knowledge_data>\n{doc_context}\n</apiit_knowledge_data>\n"
        )

    if contact_context:
        user_prompt_parts.append(
            f"<apiit_contact_data>\n{contact_context}\n</apiit_contact_data>\n"
        )

    if is_conversational_turn:
        user_prompt_parts.append(
            "Instruction: The visitor is greeting you, asking an identity/audio check, or asking for a clarification. "
            "Respond naturally, warmly, and helpfully as the APIIT AI Admissions and Marketing Coordinator, "
            "then guide the dialogue towards their study plans or questions about APIIT."
        )
    elif not doc_context and not contact_context:
        user_prompt_parts.append(
            "Instruction: No specific document chunks matched this factual inquiry. If the question asks for institutional "
            "details (like unlisted programmes or unannounced fees), state honestly that you do not have that specific detail "
            "in your verified knowledge base, and invite them to speak with our Admissions team at the Colombo campus."
        )
    else:
        user_prompt_parts.append(
            "Instruction: Answer the visitor's query accurately using the verified APIIT knowledge data above. "
            "Highlight relevant academic benefits (Staffordshire University partnership, career prospects, pathways). "
            "Keep the tone consultative and encourage an appropriate next step (e.g. asking their A/L stream or inviting for counseling)."
        )

    full_prompt = "\n".join(user_prompt_parts)

    contents = create_gemini_history(history)
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part(text=full_prompt)],
        )
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=COORDINATOR_SYSTEM_INSTRUCTION,
            temperature=0.3,
            max_output_tokens=600,
        ),
    )

    answer = response.text
    if not answer or not answer.strip():
        raise RuntimeError("Gemini returned an empty response")

    return answer.strip()


def process_chat_message(
    db: Session,
    organisation_id: uuid.UUID,
    session_id: uuid.UUID | None,
    user_message: str,
    avatar_gender: str = "female",
    stream_audio: bool = True,
) -> dict:
    """
    Main entry point for processing a chat message:
    1. Validates organisation.
    2. Retrieves or initiates the conversation session.
    3. Analyzes conversational intent and resolves query pronouns.
    4. Retrieves published APIIT knowledge chunks and contacts.
    5. Generates a natural, context-aware coordinator response with Gemini.
    6. Persists conversation messages and returns response with source citations.
    """
    # 1. Verify organisation
    organisation = db.get(Organisation, organisation_id)
    if not organisation:
        raise ValueError("Organisation not found")

    # 2. Load or create conversation session
    if session_id:
        session = db.scalar(
            select(ConversationSession).where(
                ConversationSession.id == session_id,
                ConversationSession.organisation_id == organisation_id,
            )
        )
        if not session:
            raise ValueError("Conversation session not found")
    else:
        session = ConversationSession(organisation_id=organisation_id)
        db.add(session)
        db.commit()
        db.refresh(session)

    # 3. Load previous messages (last 10 turns for context)
    previous_messages = db.scalars(
        select(ConversationMessage)
        .where(ConversationMessage.session_id == session.id)
        .order_by(ConversationMessage.created_at.desc())
        .limit(10)
    ).all()
    previous_messages = list(reversed(previous_messages))

    # 4. Save visitor's message
    user_record = ConversationMessage(
        session_id=session.id,
        role="user",
        content=user_message,
    )
    db.add(user_record)
    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    # 5. Intent Routing: Determine if query is an ordinary conversation turn
    is_meta_turn = is_conversational_meta_query(user_message)

    relevant_documents = []
    relevant_faqs = []
    contact_results = []

    if is_meta_turn:
        # Conversational / greeting / clarification turns do not require strict vector matches
        logger.info("Handling conversational meta-turn: '%s'", user_message)
    else:
        # 6. Contextualize follow-up questions with pronouns before vector searching
        search_query = contextualize_user_query(user_message, previous_messages)

        # Retrieve published document chunks from pgvector
        document_results = retrieve_relevant_document_chunks(
            db=db,
            organisation_id=organisation_id,
            question=search_query,
            limit=4,
        )
        relevant_documents = [
            doc for doc in document_results
            if doc["similarity"] >= DOCUMENT_MIN_SIMILARITY
        ]

        # Retrieve relevant FAQs (if any exist)
        faq_results = retrieve_relevant_faqs(
            db=db,
            organisation_id=organisation_id,
            question=search_query,
            limit=3,
        )
        relevant_faqs = [
            faq for faq in faq_results
            if faq["similarity"] >= FAQ_MIN_SIMILARITY
        ]

        # Retrieve department contact records
        contact_results = retrieve_relevant_contacts(
            db=db,
            organisation_id=organisation_id,
            question=user_message,
        )

    # 7. Generate response dynamically using Gemini LLM (No hardcoded fallback strings!)
    answer = generate_coordinator_response(
        question=user_message,
        history=previous_messages,
        document_results=relevant_documents,
        faq_results=relevant_faqs,
        contact_results=contact_results,
        is_conversational_turn=is_meta_turn,
    )

    fallback = False
    if not is_meta_turn and not relevant_documents and not relevant_faqs and not contact_results:
        fallback = True

    # 8. Save assistant response
    source_ids = [str(faq["faq_id"]) for faq in relevant_faqs]
    assistant_record = ConversationMessage(
        session_id=session.id,
        role="assistant",
        content=answer,
        source_faq_ids=source_ids,
    )
    db.add(assistant_record)
    session.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assistant_record)

    # 9. Prepare citation sources for the UI
    sources = []
    for doc in relevant_documents:
        sources.append({
            "type": "document",
            "document_id": str(doc["document_id"]),
            "document_title": doc["document_title"],
            "chunk_id": str(doc["chunk_id"]),
            "chunk_index": doc["chunk_index"],
            "page_number": doc.get("page_number"),
            "similarity": doc["similarity"],
        })

    for faq in relevant_faqs:
        sources.append({
            "type": "faq",
            "faq_id": str(faq["faq_id"]),
            "question": faq["question"],
            "category": faq["category"],
            "similarity": faq["similarity"],
        })
    # Synthesize audio if not delegating to WebSocket audio streaming
    audio_base64 = None
    if not stream_audio:
        from app.services.tts.tts_manager import get_tts_manager
        audio_base64 = get_tts_manager().synthesize_speech(
            text=answer,
            voice_gender=avatar_gender,
        )
    return {
        "session_id": session.id,
        "answer": answer,
        "sources": sources,
        "audio_base64": audio_base64,
        "fallback": fallback,
        "created_at": assistant_record.created_at,
    }


def generate_neural_speech(text: str, voice_persona: str = "female") -> str | None:
    """
    Backward-compatible wrapper delegating to TTSManager.
    """
    from app.services.tts.tts_manager import get_tts_manager
    return get_tts_manager().synthesize_speech(text=text, voice_gender=voice_persona)
