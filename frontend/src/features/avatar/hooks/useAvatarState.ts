import { useMemo } from "react";
import type { AvatarState, AvatarType } from "../types/avatar.types";

interface UseAvatarStateProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  selectedAvatar: AvatarType;
}

export interface UseAvatarStateReturn {
  avatarState: AvatarState;
  statusLabel: string;
  avatarName: string;
}

/**
 * Derives the active 3D Avatar state and user-friendly status badge label.
 * Priority: Listening -> Thinking (LLM RAG query) -> Speaking (TTS playback) -> Idle
 */
export const useAvatarState = ({
  isListening,
  isLoading,
  isSpeaking,
  selectedAvatar,
}: UseAvatarStateProps): UseAvatarStateReturn => {
  const avatarName = selectedAvatar === "male" ? "Alex" : "Sofia";

  const avatarState: AvatarState = useMemo(() => {
    if (isListening) return "listening";
    if (isLoading) return "thinking";
    if (isSpeaking) return "speaking";
    return "idle";
  }, [isListening, isLoading, isSpeaking]);

  const statusLabel = useMemo(() => {
    switch (avatarState) {
      case "listening":
        return "Listening to you...";
      case "thinking":
        return "Consulting knowledge base...";
      case "speaking":
        return `${avatarName} is speaking...`;
      case "idle":
      default:
        return `${avatarName} is ready`;
    }
  }, [avatarState, avatarName]);

  return {
    avatarState,
    statusLabel,
    avatarName,
  };
};

export default useAvatarState;

