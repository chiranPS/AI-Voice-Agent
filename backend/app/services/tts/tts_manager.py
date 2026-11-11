import asyncio
import concurrent.futures
import logging
import os
import re
import time
from app.services.tts.base import BaseTTSProvider
from app.services.tts.gemini_tts import GeminiTTSProvider
from app.services.tts.deepgram_tts import DeepgramTTSProvider

logger = logging.getLogger("ai_voice_agent.tts.manager")


class TTSManager:
    """
    Orchestrates TTS synthesis across configured providers.
    Supports:
    - "parallel" (default): Concurrent racing between Deepgram and Gemini. First valid audio wins; losing task cancelled.
    - "deepgram": Deepgram primary with Gemini fallback.
    - "gemini": Gemini primary with Deepgram fallback.
    - "none": Disables backend neural TTS and delegates to browser SpeechSynthesis.

    Configured via environment variables:
    - TTS_PROVIDER: "parallel" (default) | "deepgram" | "gemini" | "none"
    - TTS_RACE_TIMEOUT: timeout for racing Gemini models (default: 14s)
    - DEEPGRAM_API_KEY: API key for Deepgram Aura
    """

    def __init__(self):
        self.gemini_provider = GeminiTTSProvider()
        self.deepgram_provider = DeepgramTTSProvider()

    def _get_provider_chain(self, configured_provider: str) -> list[BaseTTSProvider]:
        prov = (configured_provider or "parallel").strip().lower()

        if prov == "deepgram":
            return [self.deepgram_provider, self.gemini_provider]
        elif prov == "gemini":
            return [self.gemini_provider, self.deepgram_provider]
        elif prov in ("none", "off", "browser"):
            return []
        else:
            return [self.deepgram_provider, self.gemini_provider]

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

        # Clean full text for complete speech synthesis
        # Truncate only if extraordinarily long (over 300 words) to protect memory
        words = cleaned.split()
        if len(words) > 300:
            cleaned = " ".join(words[:300])

        return cleaned.strip()

    async def _async_synthesize(
        self,
        text: str,
        voice_gender: str = "female",
    ) -> str | None:
        configured_provider = os.getenv("TTS_PROVIDER", "parallel").strip().lower()

        if configured_provider in ("none", "off", "browser"):
            logger.info("TTS disabled by TTS_PROVIDER='%s'. Delegating to browser voice.", configured_provider)
            return None

        clean_text = self.sanitize_text_for_speech(text)
        if not clean_text:
            return None

        # ── 1. TRUE PARALLEL RACING MODE ──
        # Both Deepgram and Gemini are launched concurrently.
        # First provider to generate valid audio wins immediately; pending provider is cancelled.
        if configured_provider == "parallel":
            t_race_start = time.perf_counter()

            async def _run_provider(name: str, prov: BaseTTSProvider) -> tuple[str, str | None]:
                audio = await prov.generate_speech(clean_text, voice_gender)
                return name, audio

            tasks = [
                asyncio.create_task(_run_provider("deepgram", self.deepgram_provider)),
                asyncio.create_task(_run_provider("gemini", self.gemini_provider)),
            ]

            winner_audio: str | None = None
            winner_provider: str | None = None

            try:
                for future in asyncio.as_completed(tasks, timeout=30.0):
                    try:
                        prov_name, audio_url = await future
                        if audio_url:
                            winner_audio = audio_url
                            winner_provider = prov_name
                            elapsed = time.perf_counter() - t_race_start
                            logger.info(
                                "Parallel TTS Race WON by provider '%s' in %.3fs (payload length: %d)",
                                winner_provider,
                                elapsed,
                                len(winner_audio),
                            )
                            break
                        else:
                            logger.warning(
                                "Parallel candidate '%s' returned empty/null audio. Waiting for other candidate...",
                                prov_name,
                            )
                    except Exception as task_exc:
                        logger.warning(
                            "Parallel candidate failed in race: %s. Waiting for other candidate...",
                            task_exc,
                        )

            except asyncio.TimeoutError:
                logger.warning("Parallel TTS Race timed out across all providers (30.0s).")
            finally:
                # Cancel remaining pending tasks
                for t in tasks:
                    if not t.done():
                        t.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)

            if winner_audio:
                return winner_audio

            logger.warning("All parallel TTS providers failed. Delegating to frontend browser SpeechSynthesis.")
            return None

        # ── 2. SEQUENTIAL FALLBACK MODE (If explicitly set to 'deepgram' or 'gemini') ──
        provider_chain = self._get_provider_chain(configured_provider)
        for provider in provider_chain:
            try:
                t0 = time.perf_counter()
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
                        "TTS synthesis succeeded with provider '%s' in %.3fs.",
                        provider.provider_name,
                        time.perf_counter() - t0,
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
            t0 = time.perf_counter()
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    result = pool.submit(
                        asyncio.run,
                        self._async_synthesize(text, voice_gender),
                    ).result(timeout=35.0)
            else:
                result = asyncio.run(self._async_synthesize(text, voice_gender))

            total_elapsed = time.perf_counter() - t0
            logger.info("Total TTS synthesize_speech execution time: %.3fs (Audio produced: %s)", total_elapsed, bool(result))
            return result
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
