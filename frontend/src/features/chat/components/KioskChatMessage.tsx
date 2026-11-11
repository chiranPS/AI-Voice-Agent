import React, { useState } from "react";
import {
  FileText,
  Volume2,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";
import type { ChatMessage as ChatMessageType, ChatSource } from "../types/chat.types";
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
  onOpenSource?: (source: ChatSource) => void;
}

/**
 * Modern University Kiosk Chat Message Bubble
 * - Distinguished visitor and assistant message surfaces
 * - Consistent typography, readable line heights
 * - Clean document source citation badges
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
      } ${isFirstInGroup ? "mt-3.5 first:mt-0" : "mt-1.5"}`}
    >
      {/* ── Left: Assistant Avatar Badge (Assistant only) ── */}
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
        className={`flex max-w-[88%] sm:max-w-[80%] md:max-w-[76%] flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm leading-relaxed transition-all ${
            isUser
              ? `bg-[#202124] text-white shadow-2xs ${
                  isLastInGroup ? "rounded-tr-xs" : ""
                }`
              : `bg-[#F5F6F7] text-[#202124] border border-[#E5E7EB]/80 shadow-2xs ${
                  isFirstInGroup ? "rounded-tl-xs" : ""
                }`
          }`}
        >
          {/* Message Text Content */}
          {isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}

          {/* ── Verified Document Citations ── */}
          {!isUser && message.sources && message.sources.length > 0 && (() => {
            // Deduplicate by document_title / question
            const uniqueSources = message.sources.reduce((acc: ChatSource[], current) => {
              const identifier = current.document_title || current.document_id || current.question || current.faq_id;
              if (identifier && !acc.some((item) => (item.document_title || item.document_id || item.question || item.faq_id) === identifier)) {
                acc.push(current);
              }
              return acc;
            }, []);

            return (
              <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                  <FileText className="h-3 w-3 text-[#ED1C24]" />
                  <span>Verified Source Material:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueSources.map((src, i) => {
                    const displayTitle =
                      src.document_title ||
                      (src.question ? `FAQ: ${src.question}` : "Institutional Policy");
                    const pageText = src.page_number ? ` • Pg ${src.page_number}` : "";

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onOpenSource?.(src)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white hover:bg-[#FEECEE] border border-[#E5E7EB] hover:border-[#ED1C24]/40 px-2 py-1 text-[11px] font-medium text-[#202124] transition text-left active:scale-95 shadow-2xs max-w-full truncate"
                        title="Click to view verified source reference"
                      >
                        <FileText className="h-3 w-3 text-[#ED1C24] shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[280px]">
                          {displayTitle}{pageText}
                        </span>
                        <ChevronRight className="h-3 w-3 text-[#6B7280] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Meta Footer: Timestamp & Action Controls ── */}
        <div
          className={`flex items-center gap-2 px-1 mt-1 text-[10px] sm:text-[11px] text-[#6B7280] ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formattedTime}</span>

          {/* Assistant Action Buttons */}
          {!isUser && (
            <div className="flex items-center gap-1 ml-1 opacity-70 hover:opacity-100 transition">
              {onReplay && (
                <button
                  type="button"
                  onClick={() => onReplay(message.content)}
                  title="Replay speech aloud"
                  aria-label="Replay speech aloud"
                  className="p-1 rounded-md hover:bg-slate-100 text-[#6B7280] hover:text-[#ED1C24] transition"
                >
                  <Volume2 className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy text"
                aria-label="Copy text"
                className="p-1 rounded-md hover:bg-slate-100 text-[#6B7280] hover:text-[#202124] transition"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-[#34EBAE]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskChatMessage;
