import abc
import io
import wave
import base64
import logging

logger = logging.getLogger("ai_voice_agent.tts")


class BaseTTSProvider(abc.ABC):
    """Abstract Base Class for text-to-speech providers."""

    @property
    @abc.abstractmethod
    def provider_name(self) -> str:
        """Human-readable identifier for the provider."""
        pass

    @abc.abstractmethod
    async def generate_speech(
        self,
        text: str,
        voice_persona: str = "female",
    ) -> str | None:
        """
        Synthesizes speech for the provided text.
        Returns a data URL (e.g. 'data:audio/wav;base64,...') or None on failure.
        """
        pass

    @staticmethod
    def pcm_to_wav(
        pcm_bytes: bytes,
        sample_rate: int = 48000,
        channels: int = 1,
        sample_width: int = 2,
    ) -> bytes:
        """
        Wraps raw linear16 PCM byte stream into standard RIFF WAV container.
        """
        with io.BytesIO() as wav_io:
            with wave.open(wav_io, "wb") as wav_file:
                wav_file.setnchannels(channels)
                wav_file.setsampwidth(sample_width)
                wav_file.setframerate(sample_rate)
                wav_file.writeframes(pcm_bytes)
            return wav_io.getvalue()

    @staticmethod
    def bytes_to_wav_data_url(wav_bytes: bytes) -> str:
        """Encodes WAV bytes to a base64 data URL."""
        b64 = base64.b64encode(wav_bytes).decode("utf-8")
        return f"data:audio/wav;base64,{b64}"

