import { useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Mic,
  MicOff,
  Send,
  X,
  AlertCircle,
  GraduationCap,
  BookOpen,
  CreditCard,
  Award,
  PhoneCall,
  Sparkles,
} from "lucide-react";

interface KioskInputBarProps {
  onSendMessage: (message: string) => void;
  onToggleVoice: () => void;
  isListening: boolean;
  isLoading: boolean;
  speechError?: string | null;
  onSelectSuggestion?: (question: string) => void;
}

const QUICK_SUGGESTIONS = [
  {
    icon: GraduationCap,
    label: "Explore Programmes",
    query: "What undergraduate degree programmes are offered at APIIT with Staffordshire University?",
  },
  {
    icon: BookOpen,
    label: "Entry Requirements",
    query: "What are the entry requirements after A/Levels or O/Levels for computing and business?",
  },
  {
    icon: CreditCard,
    label: "Tuition Fees",
    query: "What are the tuition fee structures and instalment payment plans?",
  },
  {
    icon: Award,
    label: "Scholarships",
    query: "What merit scholarships and fee waivers are available for new applicants?",
  },
  {
    icon: PhoneCall,
    label: "Contact APIIT",
    query: "How can I contact the Admissions Office or visit the Colombo City Campus?",
  },
];

/**
 * Integrated Touchscreen Input & Voice Dock
 * - Touchscreen friendly microphone with Mint Green (#34EBAE) active state
 * - Quick suggestion shortcuts for campus inquiries
 * - Single surface integration without card borders
 */
export const KioskInputBar = ({
  onSendMessage,
  onToggleVoice,
  isListening,
  isLoading,
  speechError,
  onSelectSuggestion,
}: KioskInputBarProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const clean = message.trim();
    if (!clean || isLoading) return;

    onSendMessage(clean);
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full shrink-0 flex flex-col gap-2 pt-1 bg-white">
      {/* ── Quick Question Suggestions Pill Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="h-3 w-3 text-[#ED1C24]" />
          <span className="hidden sm:inline">Suggestions:</span>
        </span>

        {QUICK_SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (onSelectSuggestion) {
                  onSelectSuggestion(item.query);
                } else {
                  onSendMessage(item.query);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F6F7] hover:bg-[#FEECEE] text-[#202124] hover:text-[#ED1C24] border border-[#E5E7EB] hover:border-[#ED1C24]/30 px-3 py-1 text-xs font-semibold whitespace-nowrap transition active:scale-95 shrink-0"
            >
              <Icon className="h-3 w-3 text-[#ED1C24]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Speech Recognition Floating Alert ── */}
      {isListening && (
        <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#34EBAE]/15 border border-[#34EBAE] text-xs font-bold text-[#202124] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34EBAE] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#34EBAE]" />
            </span>
            <span>Microphone active — speak your inquiry naturally</span>
          </div>
          <span className="text-[11px] text-[#202124]/70 font-medium hidden sm:inline">
            Tap mic to stop
          </span>
        </div>
      )}

      {/* ── Error Banner ── */}
      {!isListening && speechError && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span className="truncate">{speechError}</span>
        </div>
      )}

      {/* ── Main Input & Touch Controls ── */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Large Touchscreen Voice Button with Mint Green (#34EBAE) Accent */}
        <button
          type="button"
          onClick={onToggleVoice}
          disabled={isLoading}
          title={isListening ? "Stop listening" : "Tap to speak to assistant"}
          aria-label={isListening ? "Stop listening" : "Tap to speak to assistant"}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0 shadow-xs ${
            isListening
              ? "bg-[#34EBAE] text-[#202124] ring-4 ring-[#34EBAE]/30 animate-pulse-voice"
              : "bg-[#F5F6F7] hover:bg-[#EBECEF] text-[#202124] border border-[#E5E7EB]"
          }`}
        >
          {isListening ? (
            <MicOff className="h-5 w-5 text-[#202124]" />
          ) : (
            <Mic className="h-5 w-5 text-[#202124]" />
          )}
        </button>

        {/* Text Input Capsule */}
        <div
          className={`relative flex items-center flex-1 rounded-2xl border bg-[#F5F6F7] px-4 py-2.5 sm:py-3 transition-all ${
            isListening
              ? "border-[#34EBAE] ring-2 ring-[#34EBAE]/20 bg-white"
              : "border-[#E5E7EB] focus-within:border-[#ED1C24] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ED1C24]/10"
          }`}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening... speak now"
                : "Type your admissions or campus question..."
            }
            disabled={isLoading || isListening}
            aria-label="Type your question"
            className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-medium text-[#202124] placeholder-slate-400 outline-none disabled:opacity-50"
          />

          {message && !isLoading && (
            <button
              type="button"
              onClick={() => setMessage("")}
              title="Clear input"
              aria-label="Clear input"
              className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[#6B7280] hover:bg-slate-200 hover:text-[#202124] transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Send Button highlighted with APIIT Red (#ED1C24) */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          title="Send Question"
          aria-label="Send Question"
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#ED1C24] hover:bg-[#D91920] text-white disabled:opacity-40 disabled:hover:bg-[#ED1C24] transition-all active:scale-95 shrink-0 shadow-xs"
        >
          <Send className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
      </form>
    </div>
  );
};

export default KioskInputBar;
