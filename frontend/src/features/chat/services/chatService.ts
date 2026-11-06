import apiClient from "../../../services/api/apiClient";

import type {
  ChatRequest,
  ChatResponse,
} from "../types/chat.types";

const CHAT_ENDPOINT = "/chat";

/**
 * Send a message to the AI assistant.
 */
export const sendChatMessage = async (
  payload: ChatRequest
): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(
    CHAT_ENDPOINT,
    payload
  );

  return response.data;
};