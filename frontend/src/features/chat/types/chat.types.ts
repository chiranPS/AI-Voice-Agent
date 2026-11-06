// Request sent to the FastAPI chat endpoint
export interface ChatRequest {
  organisation_id: string;
  session_id: string | null;
  message: string;
}

// FAQ source returned by the backend
export interface ChatSource {
  faq_id: string;
  question: string;
  category: string | null;
  similarity: number;
}

// Response received from the FastAPI chat endpoint
export interface ChatResponse {
  session_id: string;
  answer: string;
  sources: ChatSource[];
  fallback: boolean;
  created_at: string;
}

// Message roles displayed in the kiosk
export type MessageRole = "user" | "assistant";

// Message displayed in the conversation
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  sources?: ChatSource[];
  fallback?: boolean;
}