export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "processed"
  | "published"
  | "failed"
  | "archived";

export interface Document {
  id: string;
  organisation_id: string;
  uploaded_by: string | null;
  title: string;
  description: string | null;
  category: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  status: DocumentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadRequest {
  title: string;
  description?: string;
  category?: string;
  file: File;
}

export interface DocumentUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
}

export interface DocumentUploadResponse {
  message: string;
  document: Document;
}

export interface DocumentProcessResponse {
  message: string;
  document: Document;
  total_chunks: number;
  total_pages: number;
}

export interface DocumentPublishResponse {
  message: string;
  document: Document;
}

export const PREDEFINED_CATEGORIES = [
  "Academic",
  "Admissions",
  "Finance",
  "Examinations",
  "Student Services",
  "Policies",
  "General Information",
  "Other",
] as const;

export type DocumentCategory = (typeof PREDEFINED_CATEGORIES)[number];

