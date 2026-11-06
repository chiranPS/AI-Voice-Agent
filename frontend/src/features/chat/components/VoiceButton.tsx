import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  isListening: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

const VoiceButton = ({
  isListening,
  isDisabled = false,
  onClick,
}: VoiceButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
      aria-pressed={isListening}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        isListening
          ? "animate-pulse bg-red-100 text-red-600 ring-2 ring-red-200"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {isListening ? (
        <MicOff size={20} />
      ) : (
        <Mic size={20} />
      )}
    </button>
  );
};

export default VoiceButton;