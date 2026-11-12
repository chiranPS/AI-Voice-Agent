import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import KioskLayout from "./components/layout/KioskLayout";
import KioskHeader from "./features/chat/components/KioskHeader";
import KioskChatOverlay from "./features/chat/components/KioskChatOverlay";
import FaqShortcutsDrawer from "./features/chat/components/FaqShortcutsDrawer";
import KioskAssistantPane from "./features/avatar/components/KioskAssistantPane";
import type { AvatarAgentState } from "./features/avatar/components/AvatarStage";

import { useChat } from "./features/chat/hooks/useChat";
import { useSpeechRecognition } from "./features/chat/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./features/chat/hooks/useSpeechSynthesis";
import { prepareSpeechText } from "./utils/speechText";
import type { AvatarType } from "./features/avatar/types/avatar.types";
import { useNeuralAudio } from "./features/chat/hooks/useNeuralAudio";
import { useStreamingAudio } from "./features/chat/hooks/useStreamingAudio";

const INACTIVITY_TIMEOUT_MS = 90000; // 90 seconds auto-reset for public kiosk

export const App = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>("female");
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const lastSpokenMessageId = useRef<string | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Backend chat service
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
  } = useChat();

  // 2. Persona-aware TTS hook (client fallback)
  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking,
    isSupported: isSpeechSupported,
  } = useSpeechSynthesis(selectedAvatar);

  // 3. Fallback callback for WebSocket streaming
  const handleStreamingFallback = useCallback(
    (text: string, avatar: AvatarType) => {
      if (isSpeechSupported) {
        console.warn("[Audio Kiosk] Streaming unavailable, activating SpeechSynthesis fallback.");
        const speechText = prepareSpeechText(text);
        speak(speechText, avatar);
      }
    },
    [isSpeechSupported, speak]
  );

  // 4. Real-time WebSocket Streaming Audio Hook (Deepgram Aura 2 / Gemini AudioWorklet)
  const {
    playStreamAudio,
    stopAudio: stopStreamingAudio,
    isAudioPlaying: isStreamingAudioPlaying,
  } = useStreamingAudio({ onFallback: handleStreamingFallback });

  // 5. Offline Neural Audio Hook (Gemini native neural speech & Deepgram complete WAV)
  const { playNeuralAudio, stopNeuralAudio, isAudioPlaying } = useNeuralAudio();

  // Unified audio stop for instant interruption / barge-in
  const stopAllAudio = useCallback(() => {
    cancelSpeech();
    stopNeuralAudio();
    stopStreamingAudio();
  }, [cancelSpeech, stopNeuralAudio, stopStreamingAudio]);

  // STT hook with barge-in callback
  const handleBargeIn = useCallback(() => {
    stopAllAudio();
  }, [stopAllAudio]);

  const handleSendMessage = useCallback(
    (text: string) => {
      stopAllAudio();
      sendMessage(text, selectedAvatar);
    },
    [sendMessage, selectedAvatar, stopAllAudio]
  );

  const {
    isListening,
    interimTranscript,
    error: speechRecognitionError,
    startListening,
    stopListening,
  } = useSpeechRecognition(handleSendMessage, handleBargeIn);

  // Derive 3D Avatar state (idle, listening, thinking, speaking, waving)
  const avatarState: AvatarAgentState = useMemo(() => {
    if (isWaving) return "waving";
    if (isListening) return "listening";
    if (isLoading) return "thinking";
    if (isSpeaking || isAudioPlaying || isStreamingAudioPlaying) return "speaking";
    return "idle";
  }, [isWaving, isListening, isLoading, isSpeaking, isAudioPlaying, isStreamingAudioPlaying]);

  const assistantName = selectedAvatar === "male" ? "Alex" : "Sofia";
  const assistantRole =
    selectedAvatar === "male"
      ? "AI Admissions Coordinator"
      : "Senior Admissions Coordinator";

  // Trigger interactive wave greeting
  const handleTriggerWave = () => {
    stopAllAudio();
    setIsWaving(true);
    if (voiceResponsesEnabled) {
      playStreamAudio(
        `Hello! Welcome to APIIT Sri Lanka. I am ${assistantName}, your AI Admissions and Marketing Coordinator. How may I assist you with your higher education journey today?`,
        selectedAvatar
      );
    }
    setTimeout(() => {
      setIsWaving(false);
    }, 3500);
  };

  // Reset conversation session
  const handleResetSession = useCallback(() => {
    stopAllAudio();
    stopListening();
    clearConversation();
    setIsWaving(false);
    lastSpokenMessageId.current = null;
  }, [stopAllAudio, stopListening, clearConversation]);

  // Inactivity Auto-Reset Timer for public kiosk readiness
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (messages.length > 0) {
        inactivityTimerRef.current = setTimeout(() => {
          handleResetSession();
        }, INACTIVITY_TIMEOUT_MS);
      }
    };

    resetTimer();

    const activityEvents = ["mousedown", "touchstart", "keydown", "mousemove"];
    const handleActivity = () => resetTimer();

    activityEvents.forEach((ev) => window.addEventListener(ev, handleActivity));

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [messages.length, handleResetSession]);

  // Automatically speak new assistant responses using Progressive Audio Stream or Neural Voice
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      !lastMessage ||
      lastMessage.role !== "assistant" ||
      lastSpokenMessageId.current === lastMessage.id
    ) {
      return;
    }

    lastSpokenMessageId.current = lastMessage.id;

    if (!voiceResponsesEnabled) return;

    // Backward compatibility: If an offline full-audio base64 was returned, play it
    if (lastMessage.audio_base64) {
      playNeuralAudio(lastMessage.audio_base64);
      return;
    }

    // Default & Preferred: Progressive real-time WebSocket audio streaming
    playStreamAudio(lastMessage.content, selectedAvatar);
  }, [messages, selectedAvatar, voiceResponsesEnabled, playNeuralAudio, playStreamAudio]);

  // Voice microphone toggle
  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopAllAudio();
      startListening();
    }
  };

  // Replay a specific message aloud
  const handleReplayMessage = (text: string) => {
    stopAllAudio();
    if (voiceResponsesEnabled) {
      playStreamAudio(text, selectedAvatar);
    }
  };

  // Toggle voice responses globally
  const handleToggleVoiceResponses = () => {
    if (voiceResponsesEnabled) {
      stopAllAudio();
      setVoiceResponsesEnabled(false);
    } else {
      setVoiceResponsesEnabled(true);
    }
  };

  // Switch persona voice smoothly
  const handleAvatarChange = (avatar: AvatarType) => {
    if (avatar === selectedAvatar) return;
    stopAllAudio();
    setSelectedAvatar(avatar);
  };

  return (
    <KioskLayout>
      {/* ─────────────────────────────────────────────────────────────
          1. INTEGRATED APIIT UNIVERSITY KIOSK HEADER
          Official Logo • Title • Availability • Quick Actions
         ───────────────────────────────────────────────────────────── */}
      <KioskHeader
        onResetSession={handleResetSession}
        onToggleShortcuts={() => setIsShortcutsOpen(true)}
        voiceEnabled={voiceResponsesEnabled}
        onToggleVoice={handleToggleVoiceResponses}
        selectedAvatar={selectedAvatar}
        onAvatarChange={handleAvatarChange}
        avatarState={avatarState}
        isOnline={true}
        onTriggerWave={handleTriggerWave}
        isWaving={isWaving}
        isLoading={isLoading}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. SINGLE UNIFIED KIOSK SURFACE: AVATAR & CONVERSATION
          Both sections live seamlessly on the same pure white canvas.
          No individual card containers, no heavy borders, no separated boxes.
         ───────────────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 min-h-0 w-full flex-col md:grid md:grid-cols-12 overflow-hidden bg-white">
        {/* LEFT PANE: 3D Virtual Concierge (Desktop & Tablet: 5 cols) */}
        <section
          aria-label="3D Virtual Admissions Concierge"
          className="relative flex flex-col justify-between items-center h-[34vh] sm:h-[38vh] md:h-full min-h-[220px] sm:min-h-[260px] md:min-h-0 w-full overflow-hidden md:col-span-5 border-b md:border-b-0 md:border-r border-[#E5E7EB]/50"
        >
          <KioskAssistantPane
            gender={selectedAvatar}
            state={avatarState}
            assistantName={assistantName}
            assistantRole={assistantRole}
            isLoading={isLoading}
            isWaving={isWaving}
            onAvatarChange={handleAvatarChange}
            onTriggerWave={handleTriggerWave}
            isListening={isListening}
          />
        </section>

        {/* RIGHT PANE: Interactive Conversation & Touch Input (Desktop & Tablet: 7 cols) */}
        <section
          aria-label="Admissions Conversation and Touch Input"
          className="relative flex flex-1 min-h-0 flex-col md:col-span-7 h-full w-full overflow-hidden bg-white"
        >
          <KioskChatOverlay
            messages={messages}
            isLoading={isLoading}
            selectedAvatar={selectedAvatar}
            interimTranscript={interimTranscript}
            onSelectSuggestion={(q) => handleSendMessage(q)}
            onReplayMessage={handleReplayMessage}
            onClearConversation={handleResetSession}
            onSendMessage={handleSendMessage}
            onToggleVoice={handleVoiceButtonClick}
            isListening={isListening}
            speechError={speechRecognitionError || error}
          />
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. UNIVERSITY FAQ DIRECTORY MODAL
         ───────────────────────────────────────────────────────────── */}
      <FaqShortcutsDrawer
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onSelectQuestion={(q) => {
          cancelSpeech();
          handleSendMessage(q);
        }}
      />
    </KioskLayout>
  );
};

export default App;
