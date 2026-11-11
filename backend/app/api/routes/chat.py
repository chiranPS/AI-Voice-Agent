import asyncio
import json
import logging
import time
import uuid

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import process_chat_message
from app.services.tts.tts_manager import get_tts_manager

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
            stream_audio=payload.stream_audio,
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


@router.websocket("/audio-stream")
async def audio_stream_websocket(websocket: WebSocket):
    """
    Dedicated WebSocket endpoint for real-time progressive TTS audio streaming.
    Protocol:
    - Client connects to /api/chat/audio-stream.
    - Client sends JSON:
        {"action": "synthesize", "text": "...", "voice_gender": "female", "stream_id": "..."}
      or
        {"action": "cancel", "stream_id": "..."}
    - Server responds with:
        JSON: {"type": "stream_start", "stream_id": "...", "sample_rate": 24000, "channels": 1, "encoding": "linear16"}
        Binary frames: raw signed 16-bit PCM chunks (24kHz, mono) forwarded immediately as produced
        JSON: {"type": "stream_end", "stream_id": "...", "duration_ms": ..., "chunks_count": ..., "bytes_count": ...}
      or on barge-in / cancellation:
        JSON: {"type": "stream_cancelled", "stream_id": "..."}
      or on failure:
        JSON: {"type": "stream_error", "stream_id": "...", "error": "..."}
    """
    await websocket.accept()
    logger.info("Audio streaming WebSocket connection accepted.")

    active_task: asyncio.Task | None = None
    current_stream_id: str | None = None

    async def _cancel_active_task():
        nonlocal active_task, current_stream_id
        if active_task and not active_task.done():
            active_task.cancel()
            try:
                await active_task
            except (asyncio.CancelledError, Exception):
                pass
            active_task = None

    async def _stream_worker(stream_id: str, text: str, voice_gender: str):
        t0 = time.perf_counter()
        try:
            # 1. Inform client the stream has commenced
            await websocket.send_json({
                "type": "stream_start",
                "stream_id": stream_id,
                "sample_rate": 24000,
                "channels": 1,
                "encoding": "linear16",
            })

            chunks_sent = 0
            bytes_sent = 0
            tts_manager = get_tts_manager()

            async for chunk in tts_manager.stream_speech(text, voice_gender):
                # Send raw binary linear16 PCM chunk
                await websocket.send_bytes(chunk)
                chunks_sent += 1
                bytes_sent += len(chunk)

            duration_ms = round((time.perf_counter() - t0) * 1000)
            await websocket.send_json({
                "type": "stream_end",
                "stream_id": stream_id,
                "duration_ms": duration_ms,
                "chunks_count": chunks_sent,
                "bytes_count": bytes_sent,
            })
            logger.info(
                "Audio stream completed successfully [id: %s, chunks: %d, bytes: %d, time: %dms]",
                stream_id,
                chunks_sent,
                bytes_sent,
                duration_ms,
            )

        except asyncio.CancelledError:
            logger.info("Audio stream worker cancelled [id: %s]", stream_id)
            try:
                await websocket.send_json({
                    "type": "stream_cancelled",
                    "stream_id": stream_id,
                })
            except Exception:
                pass
            raise
        except Exception as exc:
            logger.error("Audio stream worker error [id: %s]: %s", stream_id, exc)
            try:
                await websocket.send_json({
                    "type": "stream_error",
                    "stream_id": stream_id,
                    "error": "Failed to stream audio",
                })
            except Exception:
                pass

    try:
        while True:
            raw_msg = await websocket.receive_text()
            try:
                data = json.loads(raw_msg)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON message"})
                continue

            action = data.get("action")
            stream_id = data.get("stream_id") or str(uuid.uuid4())

            if action == "synthesize":
                # Cancel existing stream if currently in-flight (barge-in support)
                await _cancel_active_task()
                text = (data.get("text") or "").strip()
                voice_gender = data.get("voice_gender") or "female"
                current_stream_id = stream_id

                if text:
                    active_task = asyncio.create_task(
                        _stream_worker(stream_id, text, voice_gender)
                    )
                else:
                    await websocket.send_json({
                        "type": "stream_end",
                        "stream_id": stream_id,
                        "duration_ms": 0,
                        "chunks_count": 0,
                        "bytes_count": 0,
                    })

            elif action == "cancel":
                cancel_id = data.get("stream_id")
                if cancel_id is None or cancel_id == current_stream_id:
                    await _cancel_active_task()

            elif action == "ping":
                await websocket.send_json({"type": "pong"})

            else:
                logger.warning("Unrecognized audio-stream action: %s", action)

    except WebSocketDisconnect:
        logger.info("Client disconnected from audio stream WebSocket.")
    except Exception as exc:
        logger.warning("Audio stream WebSocket connection error: %s", exc)
    finally:
        await _cancel_active_task()