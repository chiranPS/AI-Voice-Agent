import { Bot, User, BookOpen, AlertCircle } from "lucide-react";

import type { ChatMessage as ChatMessageType } from "../types/chat.types";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  const formattedTime = new Date(
    message.created_at
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <Bot size={20} />
        </div>
      )}

      <div
        className={`max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-br-sm bg-blue-600 text-white"
              : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.content}
          </p>
        </div>

        <span className="mt-1 px-1 text-xs text-slate-400">
          {formattedTime}
        </span>

        {!isUser && message.fallback && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertCircle size={14} />
            Please contact the relevant university office for further assistance.
          </div>
        )}

        {!isUser &&
          message.sources &&
          message.sources.length > 0 && (
            <div className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <BookOpen size={14} />
                Information sources
              </div>

              <ul className="space-y-1">
                {message.sources.map((source) => (
                  <li
                    key={source.faq_id}
                    className="text-xs text-slate-500"
                  >
                    {source.question}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
          <User size={20} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;