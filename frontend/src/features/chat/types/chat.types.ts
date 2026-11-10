// Request sent to the FastAPI chat endpoint
export interface ChatRequest {
  organisation_id: string;
  session_id: string | null;
  message: string;
  avatar_gender?: "male" | "female";
}

// Unified Source returned by the backend (both Document chunks and FAQs)
export interface ChatSource {
  type?: "document" | "faq";
  document_id?: string;
  document_title?: string;
  chunk_id?: string;
  chunk_index?: number;
  page_number?: number | null;
  faq_id?: string;
  question?: string;
  category?: string | null;
  similarity: number;
}

// Response received from the FastAPI chat endpoint
export interface ChatResponse {
  session_id: string;
  answer: string;
  audio_base64?: string | null;
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
  audio_base64?: string | null;
  created_at: string;
  sources?: ChatSource[];
  fallback?: boolean;
}