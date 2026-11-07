import React, { useState } from "react";
import {
  User,
  CheckCheck,
  FileText,
  ChevronRight,
  Volume2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types/chat.types";
import type { AvatarType } from "../../avatar/types/avatar.types";
import AssistantAvatarBadge from "./AssistantAvatarBadge";
import MarkdownContent from "./MarkdownContent";

interface KioskChatMessageProps {
  message: ChatMessageType;
  assistantName: string;
  assistantRole: string;
  selectedAvatar?: AvatarType;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReplay?: (text: string) => void;
  onOpenSource?: (source: any) => void;
}

/**
 * Kiosk Chat Message Bubble
 * Accurately styled to match the Northstar University Kiosk visual reference:
 * - Assistant: Circular avatar picture, light-gray bubble, timestamp + double checkmarks ✓✓,
 *   institutional document reference cards [📄 View Full Policy >]
 * - Visitor: Royal blue bubble, user avatar badge, timestamp + double checkmarks ✓✓
 */
export const KioskChatMessage: React.FC<KioskChatMessageProps> = ({
  message,
  selectedAvatar = "female",
  isFirstInGroup = true,
  isLastInGroup = true,
  onReplay,
  onOpenSource,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className={`flex w-full items-start gap-2.5 sm:gap-3 ${
        isUser ? "justify-end" : "justify-start"
      } ${isFirstInGroup ? "mt-3 first:mt-0" : "mt-1.5"}`}
    >
      {/* ── Left: Assistant Avatar Badge (Only on Assistant messages) ── */}
      {!isUser && (
        <div className="w-8 sm:w-9 shrink-0 flex justify-center pt-0.5">
          {isFirstInGroup ? (
            <AssistantAvatarBadge gender={selectedAvatar} size="sm" />
          ) : (
            <div className="w-8 sm:w-9" />
          )}
        </div>
      )}

      {/* ── Message Bubble Column ── */}
      <div
        className={`flex max-w-[85%] sm:max-w-[78%] flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed transition-all ${
            isUser
              ? `bg-[#1769D2] text-white shadow-2xs ${
                  isLastInGroup ? "rounded-tr-xs" : ""
                }`
              : `bg-[#F1F5F9] text-[#142D50] border border-[#E2E8F0]/80 shadow-2xs ${
                  isFirstInGroup ? "rounded-tl-xs" : ""
                }`
          }`}
        >
          {/* Message Content: Rich Markdown for Assistant, Plain Text for User */}
          {isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}

          {/* ── Grounded Policy Citation Cards [ 📄 View Full Policy > ] ── */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              {message.sources.map((src, i) => (
                <button
                  key={src.faq_id || i}
                  type="button"
                  onClick={() => onOpenSource && onOpenSource(src)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-blue-200/90 bg-white px-3 py-2 text-left shadow-2xs hover:border-[#1769D2] hover:bg-blue-50/50 transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1769D2]">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#1769D2] truncate">
                      {src.question || "View Full Policy"}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1769D2] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          )}

          {/* Fallback Notice Alert */}
          {!isUser && message.fallback && (
            <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-xs text-amber-900 leading-snug">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Campus Desk notice: verified record not found. Please verify with campus administration.
              </span>
            </div>
          )}

          {/* Assistant Action Tools: Audio Replay & Copy */}
          {!isUser && (
            <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-slate-200/60 pt-1.5">
              {onReplay && (
                <button
                  type="button"
                  onClick={() => onReplay(message.content)}
                  title="Listen aloud"
                  className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] hover:text-[#1769D2] hover:bg-white px-1.5 py-0.5 rounded transition"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Listen</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                title="Copy response"
                className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] hover:text-[#1769D2] hover:bg-white px-1.5 py-0.5 rounded transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Timestamp & Double Checkmarks ✓✓ ── */}
        <div
          className={`flex items-center gap-1 px-1 mt-1 text-[10px] font-medium ${
            isUser ? "text-slate-500 justify-end" : "text-slate-500 justify-start"
          }`}
        >
          <span>{formattedTime}</span>
          <CheckCheck className="h-3 w-3 text-[#1769D2]" />
        </div>
      </div>

      {/* ── Right: User Avatar Badge ── */}
      {isUser && (
        <div className="w-8 sm:w-9 shrink-0 flex justify-center pt-0.5">
          {isFirstInGroup ? (
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#1769D2] text-white shadow-2xs ring-2 ring-white">
              <User className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-8 sm:w-9" />
          )}
        </div>
      )}
    </div>
  );
};

export default KioskChatMessage;
