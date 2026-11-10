import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import process_chat_message

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["AI Conversation"],
)


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    try:
        result = process_chat_message(
            db=db,
            organisation_id=payload.organisation_id,
            session_id=payload.session_id,
            user_message=payload.message,
            avatar_gender=payload.avatar_gender,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception:
        logger.exception("Chat processing failed")

        raise HTTPException(
            status_code=502,
            detail="The AI assistant is temporarily unavailable. Please try again.",
        )