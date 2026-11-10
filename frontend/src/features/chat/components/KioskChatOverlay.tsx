import { useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowDown,
  RotateCcw,
  FileText,
  X,
  Sparkles,
} from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types/chat.types";
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

const QUICK_STARTER_PROMPTS = [
  "What computing degrees are offered with Staffordshire University?",
  "What are the entry requirements after A/Levels or O/Levels?",
  "What are the tuition fees and payment instalment options?",
];

/**
 * Dedicated Interactive Conversation Pane
 * Integrated seamlessly into the right side of the combined kiosk workspace:
 * - Scrollable message thread with initial greeting
 * - Policy citation modal integration
 * - Fixed bottom touchscreen input bar [ 🎤 | Type your question... | ➤ ]
 */
export const KioskChatOverlay = ({
  messages,
  isLoading,
  selectedAvatar,
  interimTranscript,
  onReplayMessage,
  onClearConversation,
  onSendMessage,
  onToggleVoice,
  isListening,
  speechError,
}: KioskChatOverlayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [activeSourceModal, setActiveSourceModal] = useState<any | null>(null);

  const assistantName = selectedAvatar === "male" ? "Alex" : "Sophia";
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
    <div className="relative flex flex-col h-full w-full min-h-0 bg-transparent p-4 sm:p-5 md:p-6 overflow-hidden justify-between">
      {/* ── Active Conversation Top Bar (If turns > 0) ── */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0] shrink-0 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            {messages.length} {messages.length === 1 ? "Message" : "Messages"} in Session
          </span>

          {onClearConversation && (
            <button
              type="button"
              onClick={onClearConversation}
              title="Clear Session History"
              className="flex items-center gap-1 text-[11px] font-bold text-[#64748B] hover:text-[#1769D2] transition px-2 py-0.5 rounded-lg hover:bg-slate-50 active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      )}

      {/* ── Scrollable Messages Area ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 overflow-y-auto pr-1 py-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent min-h-0"
      >
        {messages.length === 0 ? (
          /* ── Default Initial Assistant Greeting (as shown in visual reference) ── */
          <div className="flex flex-col space-y-3 pt-1">
            <div className="flex w-full items-start gap-2.5 sm:gap-3 justify-start">
              <div className="w-9 sm:w-10 shrink-0 flex justify-center pt-0.5">
                <AssistantAvatarBadge gender={selectedAvatar} size="md" />
              </div>

              <div className="flex max-w-[88%] sm:max-w-[82%] flex-col items-start">
                <div className="relative rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-xs sm:text-sm lg:text-base leading-relaxed bg-[#F1F5F9] text-[#142D50] border border-[#E2E8F0]/80 shadow-2xs">
                  <p className="font-medium">
                    Hello! 👋<br />
                    Welcome to APIIT Sri Lanka. I am your AI Admissions and Marketing Coordinator. How may I assist you with your degree options, entry criteria, or campus life today?
                  </p>
                </div>

                <div className="flex items-center gap-1 px-1 mt-1 text-[10px] sm:text-xs font-medium text-slate-500 justify-start">
                  <span>10:24 AM</span>
                  <span className="text-[#1769D2] font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Quick interactive touch prompts for zero-state friendliness */}
            <div className="mt-3 pl-11 sm:pl-13 space-y-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#1769D2]" />
                <span>Suggested questions:</span>
              </span>
              <div className="flex flex-col gap-1.5">
                {QUICK_STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(prompt)}
                    className="text-left text-xs font-semibold text-[#1769D2] hover:text-[#0D47A1] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 px-3 py-1.5 rounded-xl transition-all active:scale-[0.99] truncate"
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
            <div className="flex max-w-[80%] flex-col items-end">
              <div className="rounded-2xl rounded-tr-xs border border-blue-200 bg-blue-50/90 px-3.5 py-2 text-xs sm:text-sm italic text-[#142D50] shadow-2xs animate-pulse">
                "{interimTranscript}..."
              </div>
            </div>
          </div>
        )}

        {/* Natural Animated Typing Indicator (Universal for Greetings & Inquiries) */}
        {isLoading && (
          <div className="flex w-full items-start gap-2.5 sm:gap-3 justify-start animate-fade-in">
            <div className="w-9 sm:w-10 shrink-0 flex justify-center pt-0.5">
              <AssistantAvatarBadge gender={selectedAvatar} size="md" />
            </div>
            <div className="relative rounded-2xl rounded-tl-xs px-4 py-3 bg-[#F1F5F9] text-[#142D50] border border-[#E2E8F0]/80 shadow-2xs inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1769D2]/70 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-[#1769D2]/70 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-[#1769D2]/70 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Floating "Scroll to Bottom" button */}
      {userHasScrolledUp && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1 text-xs font-bold text-[#142D50] shadow-md hover:bg-slate-50 transition active:scale-95 z-20"
        >
          <ArrowDown className="h-3 w-3 text-[#1769D2]" />
          <span>Latest message</span>
        </button>
      )}

      {/* ── Fixed Bottom Integrated Input Bar ── */}
      <div className="shrink-0 w-full pt-2.5 border-t border-[#E2E8F0]/80">
        <KioskInputBar
          onSendMessage={onSendMessage}
          onToggleVoice={onToggleVoice}
          isListening={isListening}
          isLoading={isLoading}
          speechError={speechError}
        />
      </div>

      {/* ── Full Policy Detail Modal ── */}
      {activeSourceModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative flex flex-col max-h-[90%] w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1769D2]">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Institutional Knowledge Reference
                  </h4>
                  <p className="text-sm font-bold text-[#142D50] truncate">
                    {activeSourceModal.document_title || activeSourceModal.question || "APIIT Document Citation"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSourceModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-3 text-xs sm:text-sm text-[#142D50] leading-relaxed space-y-2">
              <p className="font-semibold text-[#1769D2]">
                Category: {activeSourceModal.category || "Official University Guidelines"}
              </p>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs leading-relaxed whitespace-pre-wrap">
                {activeSourceModal.answer || activeSourceModal.content || "Full policy text is grounded in the Northstar University knowledge base."}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2.5 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSourceModal(null)}
                className="rounded-xl bg-[#1769D2] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskChatOverlay;
