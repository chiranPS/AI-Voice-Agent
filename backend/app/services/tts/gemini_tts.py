import asyncio
import os
import time
import logging
from google.genai import types
from app.services.chat_service import client
from app.services.tts.base import BaseTTSProvider

logger = logging.getLogger("ai_voice_agent.tts.gemini")

DEFAULT_GEMINI_TTS_MODELS = [
    "gemini-3.8-flash-lite-tts",
    "gemini-3.1-flash-tts-preview",
    "gemini-2.5-flash-preview-tts",
    "gemini-3.8-flash-tts",
]


class GeminiTTSProvider(BaseTTSProvider):
    """
    Parallel racing Gemini Neural TTS provider.
    Fires concurrent requests across all configured Gemini TTS models
    and accepts the first valid audio payload.
    """

    def __init__(
        self,
        models: list[str] | None = None,
        timeout_seconds: float | None = None,
    ):
        self.models = models or DEFAULT_GEMINI_TTS_MODELS
        self.timeout_seconds = (
            timeout_seconds
            if timeout_seconds is not None
            else float(os.getenv("TTS_RACE_TIMEOUT", "14.0"))
        )

    @property
    def provider_name(self) -> str:
        return "gemini"

    def _map_voice(self, voice_persona: str) -> str:
        persona = (voice_persona or "").lower()
        if persona in ("male", "puck"):
            return "Puck"
        return "Kore"

    async def _generate_single_model_speech(
        self,
        model_name: str,
        text: str,
        voice_persona: str,
    ) -> tuple[str, str]:
        """
        Submits a single async TTS generation request to one specific Gemini model.
        Returns (model_name, data_url) on success, or raises an Exception.
        """
        voice_name = self._map_voice(voice_persona)
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    )
                ),
            ),
        )

        if not response or not response.candidates:
            raise ValueError(f"No candidates returned by {model_name}")

        candidate = response.candidates[0]
        if not candidate.content or not candidate.content.parts:
            raise ValueError(f"Empty candidate content in {model_name}")

        for part in candidate.content.parts:
            inline_data = getattr(part, "inline_data", None)
            if inline_data and inline_data.data:
                raw_bytes = inline_data.data
                mime_type = (inline_data.mime_type or "").lower()

                if len(raw_bytes) < 100:
                    raise ValueError(f"Audio payload too small ({len(raw_bytes)} bytes)")

                # If raw PCM, encapsulate in standard WAV container (Gemini default 24kHz)
                if "pcm" in mime_type or "l16" in mime_type or not mime_type.startswith("audio/wav"):
                    wav_bytes = self.pcm_to_wav(raw_bytes, sample_rate=24000)
                    return model_name, self.bytes_to_wav_data_url(wav_bytes)
                else:
                    return model_name, self.bytes_to_wav_data_url(raw_bytes)

        raise ValueError(f"No inline audio data found in response from {model_name}")

    async def generate_speech(
        self,
        text: str,
        voice_persona: str = "female",
    ) -> str | None:
        """
        Races all candidate Gemini TTS models concurrently.
        First valid response wins; remaining tasks are cancelled.
        """
        t0 = time.perf_counter()
        tasks: dict[asyncio.Task, str] = {}

        for model_name in self.models:
            task = asyncio.create_task(
                self._generate_single_model_speech(
                    model_name=model_name,
                    text=text,
                    voice_persona=voice_persona,
                )
            )
            tasks[task] = model_name

        winner_model: str | None = None
        winner_audio: str | None = None

        try:
            for future in asyncio.as_completed(tasks.keys(), timeout=self.timeout_seconds):
                try:
                    model_name, audio_data = await future
                    winner_model = model_name
                    winner_audio = audio_data
                    duration = time.perf_counter() - t0
                    logger.info(
                        "Gemini TTS Race won by model: '%s' (payload length: %d, duration: %.3fs)",
                        winner_model,
                        len(winner_audio),
                        duration,
                    )
                    break
                except Exception as task_exc:
                    failed_model = tasks.get(future, "unknown")
                    logger.debug(
                        "Gemini TTS candidate '%s' failed in race: %s",
                        failed_model,
                        task_exc,
                    )
        except asyncio.TimeoutError:
            logger.warning(
                "Gemini TTS Race timed out after %.1f seconds across all models",
                self.timeout_seconds,
            )
        finally:
            for t, _ in tasks.items():
                if not t.done():
                    t.cancel()
            await asyncio.gather(*tasks.keys(), return_exceptions=True)

        return winner_audio

