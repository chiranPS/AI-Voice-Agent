import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { User, Hand } from "lucide-react";
import KioskLayout from "./components/layout/KioskLayout";
import KioskHeader from "./features/chat/components/KioskHeader";
import AssistantStatusBar from "./features/chat/components/AssistantStatusBar";
import KioskChatOverlay from "./features/chat/components/KioskChatOverlay";
import KioskBottomNav from "./features/chat/components/KioskBottomNav";
import FaqShortcutsDrawer from "./features/chat/components/FaqShortcutsDrawer";
import AvatarStage, { type AvatarAgentState } from "./features/avatar/components/AvatarStage";

import { useChat } from "./features/chat/hooks/useChat";
import { useSpeechRecognition } from "./features/chat/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./features/chat/hooks/useSpeechSynthesis";
import { prepareSpeechText } from "./utils/speechText";
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

  const assistantName = selectedAvatar === "male" ? "Alex" : "Sophia";
  const assistantRole =
    selectedAvatar === "male"
      ? "AI Admissions Coordinator"
      : "Senior Admissions Coordinator";

  // Trigger interactive wave greeting
  const handleTriggerWave = () => {
    cancelSpeech();
    setIsWaving(true);
    if (voiceResponsesEnabled && isSpeechSupported) {
      speak(
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
      const speechText = prepareSpeechText(lastMessage.content);
      speak(speechText, selectedAvatar);
    }
  }, [messages, selectedAvatar, isSpeechSupported, voiceResponsesEnabled, speak]);

  // Voice microphone toggle
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
      const speechText = prepareSpeechText(text);
      speak(speechText, selectedAvatar);
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
      {/* ─────────────────────────────────────────────────────────────
          1. TOP UNIVERSITY HEADER CARD
          [🎓] NORTHSTAR UNIVERSITY             [ 🌐 EN ▾ | ♿ | ⛶ ]
               VIRTUAL INFORMATION KIOSK
         ───────────────────────────────────────────────────────────── */}
      <KioskHeader
        onResetSession={handleResetSession}
        onToggleShortcuts={() => setIsShortcutsOpen(true)}
        voiceEnabled={voiceResponsesEnabled}
        onToggleVoice={handleToggleVoiceResponses}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. VIRTUAL ASSISTANT STATUS BAR CARD
          [ 💬 ] VIRTUAL ASSISTANT               ● Available
                 How can we help you?
         ───────────────────────────────────────────────────────────── */}
      <AssistantStatusBar
        assistantName={assistantName}
        avatarState={avatarState}
        isOnline={true}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. UNIFIED KIOSK WORKSPACE: AVATAR & CHAT COMBINED INTO ONE
          Single seamless rounded enclosure combining the 3D Virtual
          Assistant on the left and the Interactive Conversation on the right.
         ───────────────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 min-h-0 w-full flex-col rounded-3xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="relative flex flex-1 min-h-0 flex-col md:grid md:grid-cols-12 overflow-hidden w-full">
          {/* LEFT PANE: 3D Avatar Character Concierge (Desktop & Tablet: 5 cols) */}
          <section
            aria-label="3D Virtual Assistant Concierge"
            className="relative flex flex-col justify-between items-center p-3.5 sm:p-5 md:p-6 md:border-r border-b md:border-b-0 border-[#E2E8F0] md:col-span-5 h-[36vh] sm:h-[40vh] md:h-full min-h-[250px] w-full overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white"
          >
            {/* Top Controls: Persona Switcher & Wave Greeting */}
            <div className="relative z-20 flex w-full items-center justify-between shrink-0 gap-2">
              {/* Persona Switcher Pill */}
              <div className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white p-1 gap-1 shadow-2xs">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAvatarChange("male")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all duration-200 ${selectedAvatar === "male"
                      ? "bg-[#1769D2] text-white font-bold shadow-2xs"
                      : "text-[#142D50] hover:bg-slate-100 font-semibold"
                    }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Alex</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAvatarChange("female")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all duration-200 ${selectedAvatar === "female"
                      ? "bg-[#1769D2] text-white font-bold shadow-2xs"
                      : "text-[#142D50] hover:bg-slate-100 font-semibold"
                    }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sophia</span>
                </button>
              </div>

              {/* Interactive Wave Greet Action Button */}
              <button
                type="button"
                disabled={isLoading || isWaving}
                onClick={handleTriggerWave}
                title="Make assistant wave and greet you"
                className="flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-bold text-[#1769D2] shadow-2xs hover:border-blue-300 hover:bg-blue-50 transition active:scale-95"
              >
                <Hand className="h-3.5 w-3.5 text-[#1769D2]" />
                <span>Say Hello</span>
              </button>
            </div>

            {/* Central 3D Avatar Viewport with Life-Sized Waist-Up Framing */}
            <div className="relative flex-1 w-full h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] my-auto py-1 flex items-center justify-center overflow-hidden">
              <AvatarStage
                gender={selectedAvatar}
                state={avatarState}
              />
            </div>

            {/* Bottom Persona Identity Tag */}
            <div className="relative z-10 shrink-0 text-center">
              <p className="text-[11px] sm:text-xs font-bold text-[#142D50]">
                {assistantName} • <span className="text-[#64748B] font-semibold">{assistantRole}</span>
              </p>
            </div>
          </section>

          {/* RIGHT PANE: Dedicated Conversation & Touch Input (Desktop & Tablet: 7 cols) */}
          <section
            aria-label="Conversation and Touch Input"
            className="relative flex flex-1 min-h-0 flex-col md:col-span-7 h-full w-full overflow-hidden bg-white"
          >
            <KioskChatOverlay
              messages={messages}
              isLoading={isLoading}
              selectedAvatar={selectedAvatar}
              interimTranscript={interimTranscript}
              onReplayMessage={handleReplayMessage}
              onClearConversation={handleResetSession}
              onSendMessage={(msg) => {
                cancelSpeech();
                sendMessage(msg);
              }}
              onToggleVoice={handleVoiceButtonClick}
              isListening={isListening}
              speechError={speechRecognitionError || error}
            />
          </section>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. FLOATING BOTTOM NAVIGATION DOCK
          [ (⌂ Home) | ⊞ Categories | ılı Voice | ⟲ Reset | ⚙ Settings ]
         ───────────────────────────────────────────────────────────── */}
      <KioskBottomNav
        activeTab="home"
        onHome={() => {
          if (messages.length > 0) {
            handleResetSession();
          }
        }}
        onCategories={() => setIsShortcutsOpen(true)}
        voiceEnabled={voiceResponsesEnabled}
        onToggleVoice={handleToggleVoiceResponses}
        onReset={handleResetSession}
        onSettings={() => setIsShortcutsOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────
          5. SUGGESTED FAQ TOPICS DRAWER
         ───────────────────────────────────────────────────────────── */}
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
