import asyncio
import concurrent.futures
import logging
import os
import re
from app.services.tts.base import BaseTTSProvider
from app.services.tts.gemini_tts import GeminiTTSProvider
from app.services.tts.deepgram_tts import DeepgramTTSProvider

logger = logging.getLogger("ai_voice_agent.tts.manager")


class TTSManager:
    """
    Orchestrates TTS synthesis across configured providers with automatic fallback:
    Active Provider -> Configured Alternative Provider -> None (Browser SpeechSynthesis).

    Configured via environment variables:
    - TTS_PROVIDER: "gemini" (default) | "deepgram" | "none"
    - TTS_RACE_TIMEOUT: timeout for racing Gemini models (default: 14s)
    - DEEPGRAM_API_KEY: API key for Deepgram Aura
    """

    def __init__(self):
        self.gemini_provider = GeminiTTSProvider()
        self.deepgram_provider = DeepgramTTSProvider()

    def _get_provider_chain(self, configured_provider: str) -> list[BaseTTSProvider]:
        prov = (configured_provider or "gemini").strip().lower()

        if prov == "deepgram":
            return [self.deepgram_provider, self.gemini_provider]
        elif prov == "gemini":
            return [self.gemini_provider, self.deepgram_provider]
        elif prov in ("none", "off", "browser"):
            return []
        else:
            logger.warning("Unknown TTS_PROVIDER '%s', defaulting to [gemini, deepgram]", prov)
            return [self.gemini_provider, self.deepgram_provider]

    @staticmethod
    def sanitize_text_for_speech(text: str) -> str:
        """
        Normalizes institutional acronyms, degree codes, and currency for smooth,
        natural pronunciation by neural voice models.
        """
        if not text:
            return ""

        # Remove raw markdown bold/italic formatting and links
        cleaned = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
        cleaned = re.sub(r"\*([^*]+)\*", r"\1", cleaned)
        cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
        cleaned = re.sub(r"`([^`]+)`", r"\1", cleaned)
        cleaned = re.sub(r"^[-*•]\s+", "", cleaned, flags=re.MULTILINE)

        # Institutional phonetic pronunciations
        cleaned = re.sub(r"\bAPIIT\b", "App-it", cleaned)
        cleaned = re.sub(r"\bA\/Levels?\b", "A Levels", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bA\/Ls?\b", "A Levels", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bO\/Levels?\b", "O Levels", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bO\/Ls?\b", "O Levels", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bBSc\s*\(\s*Hons\s*\)", "B.S.C. Honours", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bBEng\s*\(\s*Hons\s*\)", "B.Eng. Honours", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bBSc\b", "B.S.C.", cleaned)
        cleaned = re.sub(r"\bBEng\b", "B.Eng.", cleaned)
        cleaned = re.sub(r"\bLKR\b", "Sri Lankan Rupees", cleaned)

        # Truncate text if excessively long for responsive voice output
        words = cleaned.split()
        if len(words) > 250:
            cleaned = " ".join(words[:250])

        return cleaned.strip()

    async def _async_synthesize(
        self,
        text: str,
        voice_gender: str = "female",
    ) -> str | None:
        configured_provider = os.getenv("TTS_PROVIDER", "gemini")
        provider_chain = self._get_provider_chain(configured_provider)

        if not provider_chain:
            logger.info("TTS disabled by TTS_PROVIDER='%s'. Falling back to browser voice.", configured_provider)
            return None

        clean_text = self.sanitize_text_for_speech(text)
        if not clean_text:
            return None

        # Iterate through primary and fallback providers
        for provider in provider_chain:
            try:
                logger.info(
                    "Attempting TTS synthesis via provider: '%s' (voice: %s)...",
                    provider.provider_name,
                    voice_gender,
                )
                audio_url = await provider.generate_speech(
                    text=clean_text,
                    voice_persona=voice_gender,
                )
                if audio_url:
                    logger.info(
                        "TTS synthesis succeeded with provider '%s'.",
                        provider.provider_name,
                    )
                    return audio_url
                else:
                    logger.warning(
                        "Provider '%s' failed to generate audio. Trying next provider...",
                        provider.provider_name,
                    )
            except Exception as exc:
                logger.warning(
                    "Provider '%s' encountered an exception during TTS: %s. Trying next provider...",
                    provider.provider_name,
                    exc,
                )

        logger.warning("All TTS providers failed. Delegating to frontend browser SpeechSynthesis.")
        return None

    def synthesize_speech(
        self,
        text: str,
        voice_gender: str = "female",
    ) -> str | None:
        """
        Synchronous safe entrypoint called by FastAPI chat endpoints.
        Safely bridges into the async event loop without blocking or crashing.
        """
        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    return pool.submit(
                        asyncio.run,
                        self._async_synthesize(text, voice_gender),
                    ).result(timeout=20.0)
            else:
                return asyncio.run(self._async_synthesize(text, voice_gender))
        except Exception as exc:
            logger.error("TTSManager synthesis error: %s", exc)
            return None


# Global singleton instance
_tts_manager_instance: TTSManager | None = None


def get_tts_manager() -> TTSManager:
    global _tts_manager_instance
    if _tts_manager_instance is None:
        _tts_manager_instance = TTSManager()
    return _tts_manager_instance

