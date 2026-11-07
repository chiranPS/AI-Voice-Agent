import { useCallback, useEffect, useRef, useState } from "react";
import type { AvatarType } from "../../avatar/types/avatar.types";
import { prepareSpeechText } from "../../../utils/speechText";

/**
 * Enhanced Speech Synthesis Hook supporting Persona Voices (Male & Female)
 * Automatically picks the best available system/browser voice matching the persona:
 * - Male (Alex): Deep, clear male voice (David / Guy / George / Google UK Male)
 * - Female (Sophia): Warm, natural female voice (Jenny / Zira / Samantha / Google US Female)
 */
export const useSpeechSynthesis = (defaultAvatarType: AvatarType = "female") => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Load available system voices (browser voices load asynchronously)
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  /**
   * Selects the most appropriate natural voice for the given avatar gender
   */
  const getPersonaVoice = useCallback(
    (avatar: AvatarType): { voice: SpeechSynthesisVoice | null; pitch: number; rate: number } => {
      if (voices.length === 0) {
        return {
          voice: null,
          pitch: avatar === "male" ? 0.92 : 1.08,
          rate: 1.0,
        };
      }

      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      const voicePool = englishVoices.length > 0 ? englishVoices : voices;

      if (avatar === "male") {
        // Preferred male voice keywords
        const maleKeywords = ["david", "guy", "alex", "daniel", "george", "male", "mark", "oliver"];
        const found = voicePool.find((v) =>
          maleKeywords.some((keyword) => v.name.toLowerCase().includes(keyword))
        );

        return {
          voice: found || voicePool[0] || null,
          pitch: 0.92, // Slightly lower, authoritative pitch
          rate: 1.0,
        };
      } else {
        // Preferred female voice keywords
        const femaleKeywords = ["jenny", "zira", "samantha", "victoria", "female", "karen", "susan", "serena"];
        const found = voicePool.find((v) =>
          femaleKeywords.some((keyword) => v.name.toLowerCase().includes(keyword))
        );

        return {
          voice: found || voicePool.find((v) => !v.name.toLowerCase().includes("male")) || voicePool[0] || null,
          pitch: 1.06, // Warm, clear natural pitch
          rate: 1.02,
        };
      }
    },
    [voices]
  );

  /**
   * Speak the provided text using the designated avatar persona voice
   */
  const speak = useCallback(
    (text: string, persona: AvatarType = defaultAvatarType) => {
      if (!isSupported) {
        setError("Speech synthesis is not supported in this browser.");
        return;
      }

      const speechText = prepareSpeechText(text);
      if (!speechText) return;

      // Barge-in: Cancel any currently playing speech immediately
      window.speechSynthesis.cancel();
      setError(null);

      const utterance = new SpeechSynthesisUtterance(speechText);
      currentUtteranceRef.current = utterance;

      const { voice, pitch, rate } = getPersonaVoice(persona);

      if (voice) {
        utterance.voice = voice;
      }
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setError("Voice playback encountered an issue.");
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, defaultAvatarType, getPersonaVoice]
  );

  /**
   * Cancel speech immediately (barge-in or user stop)
   */
  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  }, [isSupported]);

  // Clean up audio playback when component unmounts
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    error,
    voices,
  };
};

export default useSpeechSynthesis;
