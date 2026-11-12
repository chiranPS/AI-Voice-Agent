import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Mic,
  Volume2,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";
import KioskLayout from "./components/layout/KioskLayout";
import KioskHeader from "./features/chat/components/KioskHeader";
import KioskChatOverlay from "./features/chat/components/KioskChatOverlay";
import KioskInputBar from "./features/chat/components/KioskInputBar";
import FaqShortcutsDrawer from "./features/chat/components/FaqShortcutsDrawer";
import { AgentAudioVisualizerRadial } from "@/components/agents-ui/agent-audio-visualizer-radial";
import type { AgentState } from "@livekit/components-react";

import { useChat } from "./features/chat/hooks/useChat";
import { useSpeechRecognition } from "./features/chat/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./features/chat/hooks/useSpeechSynthesis";
import type { AvatarType } from "./features/avatar/types/avatar.types";

const INACTIVITY_TIMEOUT_MS = 90000; // 90 seconds auto-reset for public kiosk

export const App = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>("female");
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
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

  // 2. Persona-aware TTS hook
  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking,
    isSupported: isSpeechSupported,
  } = useSpeechSynthesis(selectedAvatar);

  // 3. STT hook with barge-in callback
  const handleBargeIn = useCallback(() => {
    cancelSpeech();
  }, [cancelSpeech]);

  const {
    isListening,
    interimTranscript,
    error: speechRecognitionError,
    startListening,
    stopListening,
  } = useSpeechRecognition(sendMessage, handleBargeIn);

  // 4. Derive AgentState for LiveKit Audio Visualizer
  const visualizerState: AgentState = useMemo(() => {
    if (isListening) return "listening";
    if (isLoading) return "thinking";
    if (isSpeaking) return "speaking";
    return "listening";
  }, [isListening, isLoading, isSpeaking]);

  const statusLabel = useMemo(() => {
    const name = selectedAvatar === "male" ? "Alex" : "Sofia";
    if (isListening) return "Listening to your voice...";
    if (isLoading) return "Searching knowledge base...";
    if (isSpeaking) return `${name} is speaking...`;
    return `${name} is ready to assist`;
  }, [isListening, isLoading, isSpeaking, selectedAvatar]);

  // Reset conversation session
  const handleResetSession = useCallback(() => {
    cancelSpeech();
    stopListening();
    clearConversation();
    lastSpokenMessageId.current = null;
  }, [cancelSpeech, stopListening, clearConversation]);

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

  // Automatically speak new assistant responses using persona voice
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

    if (voiceResponsesEnabled && isSpeechSupported) {
      speak(lastMessage.content, selectedAvatar);
    }
  }, [messages, selectedAvatar, isSpeechSupported, voiceResponsesEnabled, speak]);

  // Voice button toggle
  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      startListening();
    }
  };

  // Replay a specific message aloud
  const handleReplayMessage = (text: string) => {
    cancelSpeech();
    if (isSpeechSupported) {
      speak(text, selectedAvatar);
    }
  };

  // Toggle voice responses globally
  const handleToggleVoiceResponses = () => {
    if (voiceResponsesEnabled) {
      cancelSpeech();
      setVoiceResponsesEnabled(false);
    } else {
      setVoiceResponsesEnabled(true);
    }
  };

  // Switch persona voice
  const handleAvatarChange = (avatar: AvatarType) => {
    if (avatar === selectedAvatar) return;
    cancelSpeech();
    setSelectedAvatar(avatar);
  };

  return (
    <KioskLayout>
      {/* 1. Top Modernized Kiosk Header Card */}
      <KioskHeader
        onResetSession={handleResetSession}
        onToggleShortcuts={() => setIsShortcutsOpen(true)}
        voiceEnabled={voiceResponsesEnabled}
        onToggleVoice={handleToggleVoiceResponses}
      />

      {/* 2. Main Responsive Work Area:
          - Mobile: Single column with natural flow
          - Screens (lg+): Two full-height split cards with light blue accents
      */}
      <main className="relative flex flex-1 min-h-0 flex-col lg:grid lg:grid-cols-2 lg:gap-5 xl:gap-6 overflow-hidden w-full px-0.5 pb-1">
        
        {/* COLUMN 1: Visualizer & Persona Stage */}
        <section className="relative flex flex-col justify-between items-center rounded-3xl border border-sky-100/90 bg-gradient-to-b from-white via-white to-sky-50/20 p-4 sm:p-6 shadow-sm shadow-blue-900/5 lg:h-full shrink-0 lg:shrink h-[34vh] sm:h-[36vh] lg:h-full min-h-[180px] w-full overflow-hidden">
          
          {/* Persona Switcher Pill with Light Blue Gradient Active State */}
          <div className="relative z-20 flex w-full items-center justify-center shrink-0">
            <div className="inline-flex items-center rounded-full border border-sky-200/80 bg-slate-100/80 p-1 gap-1 shadow-2xs backdrop-blur-sm">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAvatarChange("male")}
                className={`flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-1.5 text-xs transition-all duration-300 ${
                  selectedAvatar === "male"
                    ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold shadow-xs shadow-blue-500/25 border border-blue-400/30"
                    : "text-slate-600 hover:text-blue-950 hover:bg-white/60 font-medium"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Male (Alex)</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAvatarChange("female")}
                className={`flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-1.5 text-xs transition-all duration-300 ${
                  selectedAvatar === "female"
                    ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold shadow-xs shadow-blue-500/25 border border-blue-400/30"
                    : "text-slate-600 hover:text-blue-950 hover:bg-white/60 font-medium"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Female (Sofia)</span>
              </button>
            </div>
          </div>

          {/* Central Radial Audio Visualizer Stage */}
          <div className="relative flex flex-1 items-center justify-center w-full my-auto py-2">
            <div className="relative flex items-center justify-center">
              {/* Clean Subtle Circular Stage Disc with Light Blue Touch */}
              <div
                className={`h-[180px] w-[180px] xs:h-[210px] xs:w-[210px] sm:h-[250px] sm:w-[250px] lg:h-[300px] lg:w-[300px] rounded-full bg-gradient-to-b from-sky-50/90 to-blue-50/40 border border-sky-100 flex items-center justify-center shadow-inner transition-all duration-500 ${
                  isSpeaking
                    ? "ring-4 ring-sky-200/80 scale-102"
                    : isListening
                    ? "ring-4 ring-emerald-200/80 scale-102"
                    : ""
                }`}
              >
                {/* LiveKit Agent Radial Audio Visualizer */}
                <div className="relative aspect-square w-[130px] xs:w-[150px] sm:w-[180px] lg:w-[230px] flex items-center justify-center">
                  <AgentAudioVisualizerRadial
                    size="xl"
                    color="#059669"
                    barCount={24}
                    radius={60}
                    state={visualizerState}
                    className="aspect-square size-auto h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* State Badge Pill with Meaningful Icons & Light Blue Glow */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/95 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs backdrop-blur-xs">
              {visualizerState === "listening" ? (
                <Mic className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              ) : visualizerState === "thinking" ? (
                <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              ) : visualizerState === "speaking" ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
              )}
              <span>{statusLabel}</span>
            </div>

            <p className="hidden lg:block text-xs font-medium text-slate-500 text-center">
              Speak naturally or type your question on the right
            </p>
          </div>
        </section>

        {/* COLUMN 2: Conversation & Voice Input */}
        <section className="relative z-20 flex flex-1 min-h-0 flex-col justify-between gap-2.5 sm:gap-3 overflow-hidden mt-2 lg:mt-0 lg:h-full w-full">
          {/* Conversation Overlay with subtle light blue touch */}
          <div className="flex-1 min-h-0 overflow-hidden w-full">
            <KioskChatOverlay
              messages={messages}
              isLoading={isLoading}
              selectedAvatar={selectedAvatar}
              interimTranscript={interimTranscript}
              onSelectSuggestion={(q) => {
                cancelSpeech();
                sendMessage(q);
              }}
              onReplayMessage={handleReplayMessage}
              onClearConversation={handleResetSession}
            />
          </div>

          {/* Minimalist Light Input Bar */}
          <div className="shrink-0 w-full pt-0.5">
            <KioskInputBar
              onSendMessage={(msg) => {
                cancelSpeech();
                sendMessage(msg);
              }}
              onToggleVoice={handleVoiceButtonClick}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              isListening={isListening}
              isLoading={isLoading}
              speechError={speechRecognitionError || error}
            />
          </div>
        </section>
      </main>

      {/* 3. Suggested FAQ Topics Drawer / Modal */}
      <FaqShortcutsDrawer
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onSelectQuestion={(q) => {
          cancelSpeech();
          sendMessage(q);
        }}
      />
    </KioskLayout>
  );
};

export default App;
