import React from "react";
import { Hand, User } from "lucide-react";
import AvatarStage, { type AvatarAgentState } from "./AvatarStage";
import type { AvatarType } from "../types/avatar.types";

interface KioskAssistantPaneProps {
  gender: AvatarType;
  state: AvatarAgentState;
  assistantName: string;
  assistantRole: string;
  isLoading: boolean;
  isWaving: boolean;
  onAvatarChange: (gender: AvatarType) => void;
  onTriggerWave: () => void;
  isListening: boolean;
}

export const KioskAssistantPane: React.FC<KioskAssistantPaneProps> = ({
  gender,
  state,
  assistantName,
  assistantRole,
  isLoading,
  isWaving,
  onAvatarChange,
  onTriggerWave,
  isListening,
}) => {
  const isSpeaking = state === "speaking";

  return (
    <div className="relative flex flex-col justify-between items-center h-full w-full overflow-hidden bg-white px-3 sm:px-5 py-3 sm:py-5 select-none">
      {/* ── Top Bar: Assistant Persona & Interactive Greet Action ── */}
      <div className="relative z-20 flex w-full items-center justify-between shrink-0 gap-2">
        {/* Persona Switcher Pill */}
        <div className="inline-flex items-center rounded-full bg-[#F5F6F7] p-1 border border-[#E5E7EB]">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onAvatarChange("female")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
              gender === "female"
                ? "bg-[#ED1C24] text-white font-bold shadow-xs"
                : "text-[#6B7280] hover:text-[#202124] font-medium"
            }`}
            title="Switch to Sophia (Female Persona)"
          >
            <User className="h-3 w-3" />
            <span>Sophia</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onAvatarChange("male")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
              gender === "male"
                ? "bg-[#ED1C24] text-white font-bold shadow-xs"
                : "text-[#6B7280] hover:text-[#202124] font-medium"
            }`}
            title="Switch to Alex (Male Persona)"
          >
            <User className="h-3 w-3" />
            <span>Alex</span>
          </button>
        </div>

        {/* Interactive Wave Greet Action */}
        <button
          type="button"
          disabled={isLoading || isWaving}
          onClick={onTriggerWave}
          title="Make assistant wave and greet you"
          className="flex items-center gap-1.5 rounded-full border border-[#ED1C24]/30 bg-white hover:bg-[#FEECEE] px-3 py-1 text-xs font-semibold text-[#ED1C24] shadow-2xs transition active:scale-95"
        >
          <Hand className="h-3.5 w-3.5 text-[#ED1C24]" />
          <span>Say Hello</span>
        </button>
      </div>

      {/* ── Central 3D Avatar Viewport ── */}
      <div className="relative flex-1 w-full h-full min-h-[220px] sm:min-h-[280px] md:min-h-[360px] flex items-center justify-center overflow-hidden my-auto">
        {/* Subtle ambient spotlight behind avatar for dimensional depth */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-radial from-[#F5F6F7] to-transparent opacity-80 blur-2xl" />
        </div>

        {/* Actual 3D Avatar Stage */}
        <div className="relative z-10 w-full h-full">
          <AvatarStage gender={gender} state={state} />
        </div>

        {/* Dynamic Voice Activity Equalizer Overlay (Active when speaking or listening) */}
        {(isListening || isSpeaking) && (
          <div className="absolute bottom-2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#34EBAE] shadow-sm backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
            {isListening ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34EBAE] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#34EBAE]" />
                </span>
                <span className="text-xs font-bold text-[#202124]">Listening to voice</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-1" />
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-2" />
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-3" />
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-4" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-1" />
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-2" />
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-3" />
                  <span className="w-1 bg-[#34EBAE] rounded-full animate-voice-wave-4" />
                </div>
                <span className="text-xs font-bold text-[#202124]">{assistantName} is speaking</span>
              </>
            )}
          </div>
        )}

        {/* Thinking Indicator */}
        {state === "thinking" && (
          <div className="absolute bottom-2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#ED1C24]/30 shadow-sm backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
            <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-ping" />
            <span className="text-xs font-semibold text-[#202124]">Consulting APIIT knowledge...</span>
          </div>
        )}
      </div>

      {/* ── Bottom Persona Identity & University Tag ── */}
      <div className="relative z-10 shrink-0 text-center pt-1">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#202124]">{assistantName}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] sm:text-xs font-medium text-[#6B7280]">{assistantRole}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium mt-0.5">
          APIIT Sri Lanka • Staffordshire University Partner
        </p>
      </div>
    </div>
  );
};

export default KioskAssistantPane;
