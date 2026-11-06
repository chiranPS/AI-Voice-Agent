import { useState } from "react";

import { sendChatMessage } from "../services/chatService";

import type {
  ChatMessage,
  ChatRequest,
} from "../types/chat.types";

const ORGANISATION_ID = "c0e954d5-1e9f-4d10-8493-3553c873c204";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    const payload: ChatRequest = {
      organisation_id: ORGANISATION_ID,
      session_id: sessionId,
      message: trimmedMessage,
    };

    try {
      const response = await sendChatMessage(payload);

      setSessionId(response.session_id);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        created_at: response.created_at,
        sources: response.sources,
        fallback: response.fallback,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("Chat request failed:", err);

      setError(
        "Unable to connect to the assistant. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    clearConversation,
  };
};