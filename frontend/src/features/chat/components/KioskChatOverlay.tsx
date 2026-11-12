import { useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowDown,
  RotateCcw,
  FileText,
  X,
  Sparkles,
} from "lucide-react";
import type { ChatMessage as ChatMessageType, ChatSource } from "../types/chat.types";
import type { AvatarType } from "../../avatar/types/avatar.types";
import KioskChatMessage from "./KioskChatMessage";
import KioskInputBar from "./KioskInputBar";
import AssistantAvatarBadge from "./AssistantAvatarBadge";

interface KioskChatOverlayProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  selectedAvatar: AvatarType;
  interimTranscript?: string;
  onSelectSuggestion?: (question: string) => void;
  onReplayMessage?: (text: string) => void;
  onClearConversation?: () => void;
  onSendMessage: (message: string) => void;
  onToggleVoice: () => void;
  isListening: boolean;
  speechError?: string | null;
}

const STARTER_PROMPTS = [
  "What computing degrees are offered with Staffordshire University?",
  "What are the entry requirements after A/Levels or O/Levels?",
  "What are the tuition fees and payment instalment options?",
];

/**
 * Dedicated Interactive Conversation Feed
 * Naturally part of the single unified kiosk surface without boxed outer cards.
 */
export const KioskChatOverlay = ({
  messages,
  isLoading,
  selectedAvatar,
  interimTranscript,
  onSelectSuggestion,
  onReplayMessage,
  onClearConversation,
  onSendMessage,
  onToggleVoice,
  isListening,
  speechError,
}: KioskChatOverlayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [activeSourceModal, setActiveSourceModal] = useState<ChatSource | null>(null);

  const assistantName = selectedAvatar === "male" ? "Alex" : "Sofia";
  const assistantRole =
    selectedAvatar === "male"
      ? "AI Admissions Coordinator"
      : "Senior Admissions Coordinator";

  // Check scroll position to determine whether user intentionally scrolled up
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setUserHasScrolledUp(!isAtBottom);
  };

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      setUserHasScrolledUp(false);
    }
  };

  // Auto-scroll on new messages or loading states
  useEffect(() => {
    if (!userHasScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isLoading, interimTranscript, userHasScrolledUp]);

  // Group consecutive messages by sender
  const messageGroups = useMemo(() => {
    return messages.map((msg, index) => {
      const prevMsg = messages[index - 1];
      const nextMsg = messages[index + 1];

      const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;
      const isLastInGroup = !nextMsg || nextMsg.role !== msg.role;

      return {
        message: msg,
        isFirstInGroup,
        isLastInGroup,
      };
    });
  }, [messages]);

  return (
    <div className="relative flex flex-col h-full w-full min-h-0 bg-white p-3 sm:p-5 md:p-6 overflow-hidden justify-between">
      {/* ── Active Conversation Header (Only when conversation has started) ── */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] shrink-0 mb-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            {messages.length} {messages.length === 1 ? "Message" : "Messages"} in Session
          </span>

          {onClearConversation && (
            <button
              type="button"
              onClick={onClearConversation}
              title="Clear Session History"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#6B7280] hover:text-[#ED1C24] transition px-2 py-0.5 rounded-lg hover:bg-[#FEECEE] active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      )}

      {/* ── Scrollable Messages Area ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3.5 overflow-y-auto pr-1 py-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent min-h-0"
      >
        {messages.length === 0 ? (
          /* ── Default Initial Assistant Greeting ── */
          <div className="flex flex-col space-y-4 pt-2">
            <div className="flex w-full items-start gap-2.5 sm:gap-3 justify-start">
              <div className="w-8 sm:w-9 shrink-0 flex justify-center pt-0.5">
                <AssistantAvatarBadge gender={selectedAvatar} size="sm" />
              </div>

              <div className="flex max-w-[90%] sm:max-w-[85%] flex-col items-start">
                <div className="relative rounded-2xl rounded-tl-xs p-4 text-xs sm:text-sm leading-relaxed bg-[#F5F6F7] text-[#202124] border border-[#E5E7EB]/80 shadow-2xs">
                  <p className="font-medium">
                    Hello! 👋<br />
                    Welcome to APIIT Sri Lanka. I am {assistantName}, your AI Admissions and Marketing Coordinator. How may I assist you with our degree programmes, entry requirements, tuition fees, or campus facilities today?
                  </p>
                </div>

                <div className="flex items-center gap-1 px-1 mt-1 text-[10px] sm:text-xs font-medium text-[#6B7280]">
                  <span>Just now</span>
                </div>
              </div>
            </div>

            {/* Quick Starter Prompts for zero-state onboarding */}
            <div className="mt-3 pl-10 sm:pl-12 space-y-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#ED1C24]" />
                <span>Popular inquiries:</span>
              </span>
              <div className="flex flex-col gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(prompt)}
                    className="text-left text-xs font-medium text-[#202124] hover:text-[#ED1C24] bg-[#F5F6F7] hover:bg-[#FEECEE] border border-[#E5E7EB] hover:border-[#ED1C24]/30 px-3.5 py-2 rounded-xl transition-all active:scale-[0.99] truncate"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Active Conversation Thread ── */
          messageGroups.map(({ message, isFirstInGroup, isLastInGroup }) => (
            <KioskChatMessage
              key={message.id}
              message={message}
              assistantName={assistantName}
              assistantRole={assistantRole}
              selectedAvatar={selectedAvatar}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              onReplay={onReplayMessage}
              onOpenSource={(src) => setActiveSourceModal(src)}
            />
          ))
        )}

        {/* Real-time speech preview bubble while user speaks */}
        {interimTranscript && (
          <div className="flex w-full items-start justify-end gap-2.5 mt-2">
            <div className="flex max-w-[85%] flex-col items-end">
              <div className="rounded-2xl rounded-tr-xs border border-[#34EBAE] bg-[#34EBAE]/10 px-4 py-2.5 text-xs sm:text-sm italic text-[#202124] shadow-2xs animate-pulse">
                "{interimTranscript}..."
              </div>
            </div>
          </div>
        )}

        {/* Natural Animated Typing Indicator */}
        {isLoading && (
          <div className="flex w-full items-start gap-2.5 sm:gap-3 justify-start animate-fade-in">
            <div className="w-8 sm:w-9 shrink-0 flex justify-center pt-0.5">
              <AssistantAvatarBadge gender={selectedAvatar} size="sm" />
            </div>
            <div className="relative rounded-2xl rounded-tl-xs px-4 py-3 bg-[#F5F6F7] text-[#202124] border border-[#E5E7EB] shadow-2xs inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Floating "Scroll to Bottom" button */}
      {userHasScrolledUp && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1 text-xs font-bold text-[#202124] shadow-md hover:bg-[#F5F6F7] transition active:scale-95 z-20"
        >
          <ArrowDown className="h-3 w-3 text-[#ED1C24]" />
          <span>Latest message</span>
        </button>
      )}

      {/* ── Fixed Bottom Integrated Input Bar ── */}
      <div className="shrink-0 w-full pt-2">
        <KioskInputBar
          onSendMessage={onSendMessage}
          onToggleVoice={onToggleVoice}
          isListening={isListening}
          isLoading={isLoading}
          speechError={speechError}
          onSelectSuggestion={onSelectSuggestion}
        />
      </div>

      {/* ── Source Citation Modal ── */}
      {activeSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEECEE] text-[#ED1C24]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#202124] line-clamp-1">
                    {activeSourceModal.document_title || "Verified Institutional Source"}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    {activeSourceModal.page_number
                      ? `Official Policy Excerpt • Page ${activeSourceModal.page_number}`
                      : "APIIT Knowledge Base"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSourceModal(null)}
                aria-label="Close reference modal"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F6F7] hover:text-[#202124] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-[#F5F6F7] p-3.5 text-xs text-[#202124] font-medium leading-relaxed max-h-[300px] overflow-y-auto">
                <p className="whitespace-pre-wrap">
                  {activeSourceModal.question ||
                    "This institutional content is verified from the official APIIT Sri Lanka prospectus and regulatory course guidelines."}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                <span>Verified by Admissions Office</span>
                <span className="font-semibold text-[#ED1C24]">
                  APIIT Colombo City Campus
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSourceModal(null)}
                className="px-4 py-2 rounded-xl bg-[#202124] hover:bg-black text-white text-xs font-semibold transition active:scale-95"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskChatOverlay;
