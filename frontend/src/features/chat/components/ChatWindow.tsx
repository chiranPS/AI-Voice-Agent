import { useEffect, useRef } from "react";

import type { ChatMessage as ChatMessageType } from "../types/chat.types";

import ChatMessage from "./ChatMessage";
import LoadingIndicator from "../../../components/common/LoadingIndicator";

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

const ChatWindow = ({
  messages,
  isLoading,
}: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Conversation
          </h2>

          <p className="text-xs text-slate-500">
            Ask your university-related questions
          </p>
        </div>

        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          Assistant Ready
        </span>
      </div>

      <div
        className="flex-1 space-y-5 overflow-y-auto p-5"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">AI</span>
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Welcome to Northstar University
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Start a conversation by asking about admissions,
              courses, fees, scholarships, or student services.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))
        )}

        {isLoading && (
          <LoadingIndicator message="Assistant is thinking..." />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;