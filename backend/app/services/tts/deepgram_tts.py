import asyncio
import json
import logging
import os
import urllib.parse
import websockets
from app.services.tts.base import BaseTTSProvider

logger = logging.getLogger("ai_voice_agent.tts.deepgram")

# Deepgram Aura Streaming TTS models
# Docs: https://developers.deepgram.com/docs/streaming-text-to-speech
DEFAULT_FEMALE_MODEL = "aura-2-thalia-en"
DEFAULT_MALE_MODEL = "aura-2-orion-en"

# Fallback Aura 1 models in case account lacks Aura-2 entitlement
AURA1_FEMALE_MODEL = "aura-luna-en"
AURA1_MALE_MODEL = "aura-orion-en"


class DeepgramTTSProvider(BaseTTSProvider):
    """
    Streaming Text-to-Speech provider using Deepgram Aura WebSocket API.
    Protocol:
    1. Connect to wss://api.deepgram.com/v1/speak?model=...&encoding=linear16&sample_rate=48000
    2. Header: Authorization: Token <DEEPGRAM_API_KEY>
    3. Send: {"type": "Speak", "text": "..."}
    4. Send: {"type": "Flush"}
    5. Receive: binary linear16 PCM audio frames until {"type": "Flushed"}
    6. Send: {"type": "Close"}
    7. Convert accumulated linear16 PCM into standard 48kHz WAV container.
    """

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        sample_rate: int = 48000,
        encoding: str = "linear16",
        timeout_seconds: float = 12.0,
    ):
        self.api_key = api_key or os.getenv("DEEPGRAM_API_KEY", "").strip()
        self.default_model = model or os.getenv("DEEPGRAM_TTS_MODEL", DEFAULT_FEMALE_MODEL)
        self.sample_rate = sample_rate
        self.encoding = encoding
        self.timeout_seconds = timeout_seconds

    @property
    def provider_name(self) -> str:
        return "deepgram"

    def _select_model(self, voice_persona: str) -> str:
        persona = (voice_persona or "").lower()
        if persona in ("male", "puck", "orion", "zeus"):
            return DEFAULT_MALE_MODEL
        return self.default_model

    async def generate_speech(
        self,
        text: str,
        voice_persona: str = "female",
    ) -> str | None:
        """
        Connects to Deepgram Streaming TTS WebSocket, submits Speak + Flush,
        accumulates binary PCM chunks until Flushed, and returns a playable WAV data URL.
        """
        api_key = self.api_key or os.getenv("DEEPGRAM_API_KEY", "").strip()
        if not api_key:
            logger.warning("Deepgram TTS skipped: DEEPGRAM_API_KEY is not configured.")
            return None

        clean_text = (text or "").strip()
        if not clean_text:
            logger.warning("Deepgram TTS skipped: Empty text provided.")
            return None

        # Truncate text if it exceeds reasonable single-turn limits (Deepgram limit is 2000 chars per Speak)
        if len(clean_text) > 1800:
            clean_text = clean_text[:1800]

        model = self._select_model(voice_persona)

        # Attempt synthesis with primary model, then with Aura 1 fallback if needed
        audio_url = await self._stream_synthesize(clean_text, model, api_key)
        if audio_url:
            return audio_url

        # If Aura-2 model was requested and failed, try Aura-1 fallback
        if "aura-2" in model:
            fallback_model = (
                AURA1_MALE_MODEL if voice_persona.lower() in ("male", "puck") else AURA1_FEMALE_MODEL
            )
            logger.info("Attempting Deepgram fallback model '%s'...", fallback_model)
            audio_url = await self._stream_synthesize(clean_text, fallback_model, api_key)
            if audio_url:
                return audio_url

        return None

    async def _stream_synthesize(
        self,
        text: str,
        model: str,
        api_key: str,
    ) -> str | None:
        """Internal helper to stream from Deepgram WebSocket."""
        query_params = {
            "model": model,
            "encoding": self.encoding,
            "sample_rate": str(self.sample_rate),
        }
        query_string = urllib.parse.urlencode(query_params)
        ws_url = f"wss://api.deepgram.com/v1/speak?{query_string}"
        headers = {"Authorization": f"Token {api_key}"}

        pcm_chunks: list[bytes] = []

        try:
            async with websockets.connect(
                ws_url,
                additional_headers=headers,
                open_timeout=self.timeout_seconds,
                close_timeout=3.0,
            ) as ws:
                logger.debug("Connected to Deepgram TTS WebSocket (model: %s)", model)

                # Send text chunk
                speak_msg = {"type": "Speak", "text": text}
                await ws.send(json.dumps(speak_msg))

                # Send Flush signal indicating completion of text submission
                flush_msg = {"type": "Flush"}
                await ws.send(json.dumps(flush_msg))

                # Receive stream until Flushed or timeout
                async with asyncio.timeout(self.timeout_seconds):
                    async for raw_message in ws:
                        if isinstance(raw_message, bytes):
                            pcm_chunks.append(raw_message)
                        elif isinstance(raw_message, str):
                            try:
                                data = json.loads(raw_message)
                                msg_type = data.get("type")
                                if msg_type == "Flushed":
                                    logger.debug("Deepgram received 'Flushed' confirmation.")
                                    break
                                elif msg_type == "Metadata":
                                    logger.debug("Deepgram TTS metadata: %s", data.get("request_id"))
                                elif msg_type == "Warning":
                                    logger.warning("Deepgram TTS warning: %s", data.get("warn_msg"))
                                elif msg_type == "Error":
                                    logger.error("Deepgram TTS error event: %s", data.get("error_msg"))
                                    return None
                            except json.JSONDecodeError:
                                pass

                # Tell Deepgram to cleanly close
                try:
                    await ws.send(json.dumps({"type": "Close"}))
                except Exception:
                    pass

            if not pcm_chunks:
                logger.warning("Deepgram returned no audio chunks for model '%s'", model)
                return None

            total_pcm = b"".join(pcm_chunks)
            if len(total_pcm) < 100:
                logger.warning("Deepgram audio data too small (%d bytes)", len(total_pcm))
                return None

            # Convert linear16 PCM to standard RIFF WAV at configured sample rate
            wav_bytes = self.pcm_to_wav(total_pcm, sample_rate=self.sample_rate)
            data_url = self.bytes_to_wav_data_url(wav_bytes)

            logger.info(
                "Deepgram TTS successfully generated audio: model='%s', bytes=%d, rate=%dHz",
                model,
                len(wav_bytes),
                self.sample_rate,
            )
            return data_url

        except asyncio.TimeoutError:
            logger.warning("Deepgram TTS streaming timed out after %.1fs", self.timeout_seconds)
            return None
        except websockets.exceptions.InvalidStatusCode as isc:
            logger.error("Deepgram WebSocket handshake failed HTTP status %s", isc.status_code)
            return None
        except Exception as exc:
            # Do not leak API keys in log
            clean_err = str(exc).replace(api_key, "***") if api_key else str(exc)
            logger.error("Deepgram TTS streaming failed: %s", clean_err)
            return None

