import { useEffect, useRef, useState } from "react";
import {
  User,
  AlertCircle,
  BookOpen,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  GraduationCap,
  Clock,
  HelpCircle,
  Building,
  Globe,
  Home,
  ArrowRight,
} from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types/chat.types";
import type { AvatarType } from "../../avatar/types/avatar.types";

interface KioskChatOverlayProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  selectedAvatar: AvatarType;
  interimTranscript?: string;
  onSelectSuggestion?: (question: string) => void;
  onReplayMessage?: (text: string) => void;
  onClearConversation?: () => void;
}

const KIOSK_DIRECTORY_PRESETS = [
  {
    category: "Admissions",
    tag: "Programs & Requirements",
    icon: GraduationCap,
    question: "How do I apply for undergraduate admission?",
  },
  {
    category: "Library & Study",
    tag: "Hours & Locations",
    icon: Clock,
    question: "What are the university library opening hours?",
  },
  {
    category: "Scholarships",
    tag: "Funding & Grants",
    icon: HelpCircle,
    question: "What scholarships and financial aids are available?",
  },
  {
    category: "Student Services",
    tag: "Campus Desks",
    icon: Building,
    question: "Where is the student services desk located?",
  },
  {
    category: "International",
    tag: "Global Support",
    icon: Globe,
    question: "Who can I contact for international student queries?",
  },
  {
    category: "Housing",
    tag: "Student Residence",
    icon: Home,
    question: "Where can I find information on student accommodation?",
  },
];

export const KioskChatOverlay = ({
  messages,
  isLoading,
  selectedAvatar,
  interimTranscript,
  onSelectSuggestion,
  onReplayMessage,
  onClearConversation,
}: KioskChatOverlayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading, interimTranscript]);

  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const assistantName = selectedAvatar === "male" ? "Alex" : "Sophia";
  const assistantRole =
    selectedAvatar === "male"
      ? "Lead Academic Advisor"
      : "Senior Campus Concierge";

  return (
    <div className="relative flex flex-col w-full h-full min-h-0 bg-transparent overflow-hidden">
      {/* Optional Conversation Controls Bar when messages exist */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-sky-100 bg-sky-50/40 shrink-0 rounded-2xl mb-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            {messages.length} {messages.length === 1 ? "Turn" : "Turns"} in Session
          </span>

          {onClearConversation && (
            <button
              type="button"
              onClick={onClearConversation}
              title="Clear Session History"
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-blue-700 transition px-2.5 py-1 rounded-lg hover:bg-blue-100/60"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      )}

      {/* Scrollable Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          /* Empty / Interactive Kiosk Directory Attractor */
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center my-auto">
            {/* Holographic Icon Badge */}
            <div className="relative mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/25 ring-4 ring-sky-100">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Welcome! I am {assistantName}
            </h3>
            <p className="mt-1 text-xs text-blue-600 font-bold uppercase tracking-wider">
              {assistantRole} • Northstar University
            </p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm sm:max-w-md leading-relaxed">
              Tap any popular campus service below or speak directly into the kiosk microphone.
            </p>

            {/* Interactive Touch Directory Cards Grid */}
            {onSelectSuggestion && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full">
                {KIOSK_DIRECTORY_PRESETS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectSuggestion(item.question)}
                      className="group relative flex items-center justify-between rounded-2xl border border-sky-100 bg-white p-3 text-left hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/10 transition-all active:scale-98"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-blue-600 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-sky-500 group-hover:text-white transition-all shadow-2xs">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {item.category}
                          </span>
                          <span className="block text-xs font-semibold text-slate-800 truncate group-hover:text-blue-900">
                            {item.question}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Rendered Conversation Messages */
          messages.map((message) => {
            const isUser = message.role === "user";
            const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={message.id}
                className={`flex w-full items-start gap-2.5 sm:gap-3.5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar Badge on Left */}
                {!isUser && (
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-xs font-bold text-sm">
                    {assistantName[0]}
                  </div>
                )}

                {/* Message Bubble Column */}
                <div
                  className={`flex max-w-[85%] sm:max-w-[80%] flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`group relative rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "rounded-tr-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-sm font-medium"
                        : "rounded-tl-xs bg-white text-slate-800 border border-sky-200/80 shadow-xs"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-1 flex items-center justify-between border-b border-slate-100 pb-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        <span>{assistantName} • {assistantRole}</span>
                        <span className="text-slate-400 font-normal">{formattedTime}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* Grounded FAQ Sources tag if present */}
                    {!isUser && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-sky-100 text-[11px] text-blue-900 font-semibold flex items-center gap-1.5 bg-sky-50/60 p-2 rounded-lg">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span className="truncate">Source: {message.sources[0].question}</span>
                      </div>
                    )}

                    {/* Grounding Fallback alert */}
                    {!isUser && message.fallback && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>Please contact the university information desk for unverified inquiries.</span>
                      </div>
                    )}

                    {/* Assistant Quick Actions: Audio Replay & Copy */}
                    {!isUser && (
                      <div className="mt-2.5 pt-1.5 flex items-center justify-end gap-2 border-t border-slate-100">
                        {onReplayMessage && (
                          <button
                            type="button"
                            onClick={() => onReplayMessage(message.content)}
                            title="Re-play spoken voice response"
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-sky-50 transition"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Listen Again</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(message.id, message.content)}
                          title="Copy response to clipboard"
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-sky-50 transition"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Timestamp */}
                  {isUser && (
                    <span className="mt-1 px-1 text-[10px] sm:text-[11px] font-medium text-slate-400">
                      {formattedTime}
                    </span>
                  )}
                </div>

                {/* User Avatar Badge on Right */}
                {isUser && (
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-blue-700 shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Real-time live speech transcript preview */}
        {interimTranscript && (
          <div className="flex w-full items-start justify-end gap-2.5">
            <div className="flex max-w-[80%] flex-col items-end">
              <div className="rounded-2xl rounded-tr-xs border border-sky-300 bg-sky-50/90 px-4 py-2.5 text-xs italic text-blue-900 shadow-2xs">
                "{interimTranscript}..."
              </div>
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs font-bold text-blue-700 px-2 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            <span>{assistantName} is consulting university records...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskChatOverlay;
