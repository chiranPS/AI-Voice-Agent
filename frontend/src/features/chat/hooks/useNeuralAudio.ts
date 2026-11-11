import { useCallback, useRef, useState, useEffect } from "react";

export const useNeuralAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNeuralAudio = useCallback(
    (audioPayload: string, onEnded?: () => void) => {
      // Cancel any ongoing audio playback (barge-in support)
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      try {
        const audioSrc = audioPayload.startsWith("data:")
          ? audioPayload
          : `data:audio/wav;base64,${audioPayload}`;

        const tPlayInit = performance.now();
        const audio = new Audio(audioSrc);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          const tPlayStart = Math.round(performance.now() - tPlayInit);
          console.log(`[Audio Latency] Browser Audio decode and playback start: ${tPlayStart}ms`);
        };
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
          if (onEnded) onEnded();
        };
        audio.onerror = (e) => {
          console.warn("Neural audio playback error, falling back to TTS:", e);
          setIsPlaying(false);
          audioRef.current = null;
          if (onEnded) onEnded();
        };

        audio.play().catch((err) => {
          console.warn("Audio autoplay blocked by browser policy:", err);
          setIsPlaying(false);
        });
      } catch (err) {
        console.error("Failed to construct audio element:", err);
        setIsPlaying(false);
      }
    },
    []
  );

  const stopNeuralAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    playNeuralAudio,
    stopNeuralAudio,
    isAudioPlaying: isPlaying,
    playBase64Audio: playNeuralAudio,
    stopAudio: stopNeuralAudio,
    isPlaying,
  };
};
