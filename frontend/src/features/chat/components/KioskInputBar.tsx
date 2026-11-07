import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Mic, MicOff, Send, X, AlertCircle } from "lucide-react";

interface KioskInputBarProps {
  onSendMessage: (message: string) => void;
  onToggleVoice: () => void;
  isListening: boolean;
  isLoading: boolean;
  speechError?: string | null;
}

/**
 * Integrated Touchscreen Input Bar
 * Perfectly matching the conversation card input dock from the reference design:
 * [ (🎤) ] [  Type your question...  (x) ] [ (➤) ]
 */
export const KioskInputBar = ({
  onSendMessage,
  onToggleVoice,
  isListening,
  isLoading,
  speechError,
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
    <div className="relative w-full shrink-0">
      {/* ── Active Speech Recognition Floating Alert ── */}
      {isListening && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-md animate-bounce z-30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <span>Listening... speak naturally</span>
        </div>
      )}

      {/* ── Speech Recognition Error Banner ── */}
      {!isListening && speechError && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 max-w-[92%] truncate rounded-full border border-rose-300 bg-rose-50 px-3 py-0.5 text-[11px] font-semibold text-rose-700 shadow-xs z-30 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-rose-600 shrink-0" />
          <span className="truncate">{speechError}</span>
        </div>
      )}

      {/* ── Main Input Bar Container ── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 w-full pt-1"
      >
        {/* 1. Left Circular Blue Microphone Button */}
        <button
          type="button"
          onClick={onToggleVoice}
          disabled={isLoading}
          title={isListening ? "Stop listening" : "Tap to speak question"}
          aria-label={isListening ? "Stop listening" : "Tap to speak question"}
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all active:scale-95 shrink-0 shadow-xs ${
            isListening
              ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-200"
              : "bg-[#1769D2] text-white hover:bg-blue-700 shadow-blue-500/20"
          }`}
        >
          {isListening ? (
            <MicOff className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
          ) : (
            <Mic className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
          )}
        </button>

        {/* 2. Middle Pill-Shaped Input Capsule */}
        <div
          className={`relative flex items-center flex-1 rounded-full border bg-[#F8FAFC] px-4 py-2 sm:py-2.5 transition-all shadow-2xs ${
            isListening
              ? "border-emerald-500 ring-2 ring-emerald-100 bg-white"
              : "border-[#E2E8F0] focus-within:border-[#1769D2] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100"
          }`}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? "Listening to your voice..." : "Type your question..."
            }
            disabled={isLoading || isListening}
            aria-label="Type your question"
            className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-medium text-[#142D50] placeholder-slate-400 outline-none disabled:opacity-50"
          />

          {/* Clear text button */}
          {message && !isLoading && (
            <button
              type="button"
              onClick={() => setMessage("")}
              title="Clear input"
              aria-label="Clear input"
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 3. Right Circular Blue Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          title="Send Question"
          aria-label="Send Question"
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#1769D2] text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#1769D2] transition-all active:scale-95 shrink-0 shadow-xs"
        >
          <Send className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </button>
      </form>
    </div>
  );
};

export default KioskInputBar;
