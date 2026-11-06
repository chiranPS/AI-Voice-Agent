import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Mic, MicOff, Sparkles, Send, X } from "lucide-react";

interface KioskInputBarProps {
  onSendMessage: (message: string) => void;
  onToggleVoice: () => void;
  onOpenShortcuts?: () => void;
  isListening: boolean;
  isLoading: boolean;
  speechError?: string | null;
}

/**
 * Modern UI Kiosk Input Dock
 * Touchscreen-optimized floating bar featuring an oversized tactile microphone button,
 * live speech state alerts, and quick topic launchers.
 */
export const KioskInputBar = ({
  onSendMessage,
  onToggleVoice,
  onOpenShortcuts,
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
    <div className="relative w-full max-w-full">
      {/* Listening Live Floating Banner */}
      {isListening && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-xs font-bold text-emerald-800 shadow-lg shadow-emerald-900/10 animate-bounce">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </span>
          <span>Listening to your question... Speak naturally</span>
        </div>
      )}

      {/* Voice Error Bubble if mic error occurred */}
      {!isListening && speechError && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 max-w-[92%] truncate rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 shadow-sm">
          {speechError}
        </div>
      )}

      {/* Main Glassmorphic Capsule */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center justify-between rounded-full border bg-white p-2 pl-5 sm:pl-7 shadow-md shadow-blue-900/5 transition-all w-full overflow-hidden ${
          isListening
            ? "border-emerald-500 ring-4 ring-emerald-100/80"
            : "border-sky-300/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-sky-100"
        }`}
      >
        {/* Text Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening to your voice..."
              : "Ask anything about Northstar University..."
          }
          disabled={isLoading || isListening}
          aria-label="Your question"
          className="w-full min-w-0 bg-transparent pr-3 text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 outline-none disabled:opacity-50"
        />

        {/* Clear typed text button */}
        {message && !isLoading && (
          <button
            type="button"
            onClick={() => setMessage("")}
            title="Clear text"
            className="mr-2 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-sky-50 hover:text-blue-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Topics Launcher */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Browse University Topics"
              aria-label="Browse University Topics"
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-slate-500 hover:bg-sky-50 hover:text-blue-600 transition shrink-0"
            >
              <Sparkles className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Oversized Tactile Microphone Button with Gradient Ring */}
          <button
            type="button"
            onClick={onToggleVoice}
            disabled={isLoading}
            title={isListening ? "Stop listening" : "Tap to Speak"}
            aria-label={isListening ? "Stop listening" : "Tap to Speak"}
            className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all active:scale-95 shrink-0 shadow-md ${
              isListening
                ? "bg-gradient-to-tr from-rose-500 to-emerald-500 text-white animate-pulse ring-4 ring-emerald-200 shadow-emerald-500/30"
                : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-blue-500/30 hover:scale-105"
            }`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </button>

          {/* Send Icon Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            title="Send Question"
            aria-label="Send Question"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-blue-600 hover:bg-sky-50 hover:text-blue-800 transition disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default KioskInputBar;
