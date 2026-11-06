import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Mic,
  Volume2,
  Loader2,
  CheckCircle2,
  User,
  Hand,
} from "lucide-react";
import KioskLayout from "./components/layout/KioskLayout";
import KioskHeader from "./features/chat/components/KioskHeader";
import KioskChatOverlay from "./features/chat/components/KioskChatOverlay";
import KioskInputBar from "./features/chat/components/KioskInputBar";
import FaqShortcutsDrawer from "./features/chat/components/FaqShortcutsDrawer";
import AvatarStage, { type AvatarAgentState } from "./features/avatar/components/AvatarStage";
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

  // Derive 3D Avatar state (idle, listening, thinking, speaking, waving)
  const avatarState: AvatarAgentState = useMemo(() => {
    if (isWaving) return "waving";
    if (isListening) return "listening";
    if (isLoading) return "thinking";
    if (isSpeaking) return "speaking";
    return "idle";
  }, [isWaving, isListening, isLoading, isSpeaking]);

  // Agent state for the status badge
  const visualizerState: AgentState = useMemo(() => {
    if (isListening) return "listening";
    if (isLoading) return "thinking";
    if (isSpeaking) return "speaking";
    return "listening";
  }, [isListening, isLoading, isSpeaking]);

  const assistantName = selectedAvatar === "male" ? "Alex" : "Sophia";
  const assistantRole =
    selectedAvatar === "male"
      ? "Lead Academic Advisor"
      : "Senior Campus Concierge";

  const statusLabel = useMemo(() => {
    if (isWaving) return `${assistantName} is welcoming you!`;
    if (isListening) return "Listening to your voice...";
    if (isLoading) return "Searching university records...";
    if (isSpeaking) return `${assistantName} is responding...`;
    return `${assistantName} is ready to assist`;
  }, [isWaving, isListening, isLoading, isSpeaking, assistantName]);

  // Trigger interactive wave greeting
  const handleTriggerWave = () => {
    cancelSpeech();
    setIsWaving(true);
    if (voiceResponsesEnabled && isSpeechSupported) {
      speak(
        `Hello! Welcome to North Star University. I am ${assistantName}, your virtual concierge. How may I assist you today?`,
        selectedAvatar
      );
    }
    setTimeout(() => {
      setIsWaving(false);
    }, 3500);
  };

  // Reset conversation session
  const handleResetSession = useCallback(() => {
    cancelSpeech();
    stopListening();
    clearConversation();
    setIsWaving(false);
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

  // Switch persona voice smoothly
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

      {/* 2. Unified Kiosk Card Enclosure:
          Combines 3D Avatar Assistant Stage & Interactive Concierge Hub into ONE seamless enclosure.
          - Mobile / Portrait: Stacked vertical flow inside a single rounded kiosk enclosure
          - Desktop (lg+): 2-column split within the same enclosure with subtle inner divider
      */}
      <main className="relative flex flex-1 min-h-0 flex-col overflow-hidden w-full px-0.5 pb-1">
        <div className="relative flex flex-1 min-h-0 flex-col lg:grid lg:grid-cols-12 rounded-3xl border border-sky-200/90 bg-gradient-to-b from-white via-white to-sky-50/20 shadow-lg shadow-blue-950/5 backdrop-blur-xl overflow-hidden w-full">
          
          {/* PANE 1: Virtual Concierge 3D Stage (Desktop: 5 cols, Mobile/Portrait: Upper Section) */}
          <section className="relative flex flex-col justify-between items-center p-3.5 sm:p-5 lg:p-6 lg:border-r border-b lg:border-b-0 border-sky-100/90 lg:col-span-5 h-[39vh] sm:h-[43vh] lg:h-full min-h-[260px] w-full overflow-hidden bg-gradient-to-b from-sky-50/20 via-transparent to-transparent">
            
            {/* Persona Switcher with Role Details */}
            <div className="relative z-20 flex w-full items-center justify-between shrink-0 gap-2">
              {/* Persona Switcher Pill */}
              <div className="inline-flex items-center rounded-2xl border border-sky-200/90 bg-slate-100/90 p-1 gap-1 shadow-2xs backdrop-blur-sm">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAvatarChange("male")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-1.5 text-xs transition-all duration-300 ${
                    selectedAvatar === "male"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white font-bold shadow-sm shadow-blue-500/25"
                      : "text-slate-600 hover:text-blue-950 hover:bg-white/70 font-medium"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Alex</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAvatarChange("female")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-1.5 text-xs transition-all duration-300 ${
                    selectedAvatar === "female"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white font-bold shadow-sm shadow-blue-500/25"
                      : "text-slate-600 hover:text-blue-950 hover:bg-white/70 font-medium"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sophia</span>
                </button>
              </div>

              {/* Interactive "Wave / Greet" Action Button */}
              <button
                type="button"
                disabled={isLoading || isWaving}
                onClick={handleTriggerWave}
                title="Make assistant wave and greet you"
                className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs hover:border-blue-400 hover:bg-sky-50 transition active:scale-95"
              >
                <Hand className="h-3.5 w-3.5 text-blue-600" />
                <span>Say Hello</span>
              </button>
            </div>

            {/* Central 3D Avatar Viewport - Life-Sized, Prominent & Unconstrained */}
            <div className="relative flex-1 w-full h-full min-h-[190px] sm:min-h-[250px] lg:min-h-[440px] my-auto py-1 flex items-center justify-center overflow-hidden">
              <AvatarStage
                gender={selectedAvatar}
                state={avatarState}
              />
            </div>

            {/* Live Reactive State Badge Bar */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 shrink-0 w-full">
              <div className="inline-flex items-center gap-2.5 rounded-2xl border border-sky-200 bg-white/95 px-5 py-2 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md">
                {visualizerState === "listening" ? (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                ) : visualizerState === "thinking" ? (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                ) : visualizerState === "speaking" ? (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Volume2 className="h-4 w-4 animate-bounce" />
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                )}
                <span>{statusLabel}</span>
              </div>

              <p className="hidden lg:block text-xs font-medium text-slate-500 text-center">
                {assistantName} ({assistantRole})
              </p>
            </div>
          </section>

          {/* PANE 2: Interactive Concierge Conversation & Voice Input Dock */}
          <section className="relative z-20 flex flex-1 min-h-0 flex-col justify-between p-3 sm:p-5 lg:p-6 lg:col-span-7 h-full w-full overflow-hidden bg-white/50">
            {/* Conversation Messages / Attractor Grid */}
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

            {/* Integrated Kiosk Input Bar */}
            <div className="shrink-0 w-full pt-2 sm:pt-3">
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
        </div>
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
