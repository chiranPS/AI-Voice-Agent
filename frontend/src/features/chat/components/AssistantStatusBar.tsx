import React from "react";
import { MessageSquareText } from "lucide-react";
import type { AvatarAgentState } from "../../avatar/components/AvatarStage";

interface AssistantStatusBarProps {
  assistantName: string;
  avatarState?: AvatarAgentState;
  isOnline?: boolean;
}

/**
 * Assistant Status Bar Card
 * Direct match for the floating card in the Northstar University Kiosk design reference:
 * [ 💬 ] VIRTUAL ASSISTANT               ● Available
 *        How can we help you?
 */
export const AssistantStatusBar: React.FC<AssistantStatusBarProps> = ({
  assistantName,
  avatarState = "idle",
  isOnline = true,
}) => {
  // Derive human-readable availability text based on avatar's live active state
  let statusText = "Available";
  let statusColor = "text-emerald-700";
  let dotColor = "bg-emerald-500";
  let badgeBg = "bg-emerald-50/90 border-emerald-200/90";

  if (!isOnline) {
    statusText = "Offline";
    statusColor = "text-slate-600";
    dotColor = "bg-slate-400";
    badgeBg = "bg-slate-100 border-slate-200";
  } else if (avatarState === "listening") {
    statusText = "Listening...";
    statusColor = "text-emerald-700";
    dotColor = "bg-emerald-500";
    badgeBg = "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100";
  } else if (avatarState === "thinking") {
    statusText = "Processing...";
    statusColor = "text-[#1769D2]";
    dotColor = "bg-[#1769D2]";
    badgeBg = "bg-blue-50 border-blue-200 ring-2 ring-blue-100";
  } else if (avatarState === "speaking") {
    statusText = `${assistantName} is speaking...`;
    statusColor = "text-[#1769D2]";
    dotColor = "bg-[#1769D2]";
    badgeBg = "bg-blue-50 border-blue-200";
  } else if (avatarState === "waving") {
    statusText = "Welcoming you!";
    statusColor = "text-[#1769D2]";
    dotColor = "bg-[#1769D2]";
    badgeBg = "bg-blue-50 border-blue-200";
  }

  return (
    <div className="relative z-20 flex w-full items-center justify-between rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white/95 px-4 sm:px-6 py-2.5 sm:py-3 shadow-xs backdrop-blur-md shrink-0">
      {/* Left: Chat Icon & Prompt Stack */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        {/* Blue Circular Icon Container */}
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#1769D2] text-white shadow-xs">
          <MessageSquareText className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </div>

        {/* Text Stack */}
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] leading-none">
            Virtual Assistant
          </span>
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-[#142D50] leading-snug truncate mt-0.5">
            How can we help you?
          </h2>
        </div>
      </div>

      {/* Right: Dynamic Availability Pill Badge */}
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 transition-all shadow-2xs ${badgeBg}`}
        aria-label={`Assistant status: ${statusText}`}
      >
        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
          {isOnline && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor} opacity-75`}
            />
          )}
          <span
            className={`relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${dotColor}`}
          />
        </span>
        <span className={`text-xs sm:text-sm font-bold ${statusColor} whitespace-nowrap`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default AssistantStatusBar;

