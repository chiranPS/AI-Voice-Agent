import api from "./api";
import type {
  Document,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentUploadResponse,
  DocumentProcessResponse,
  DocumentPublishResponse,
} from "../types/document";

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>("/documents/");
    return response.data;
  },

  async getDocumentById(documentId: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${documentId}`);
    return response.data;
  },

  async uploadDocument(
    data: DocumentUploadRequest,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append("title", data.title.trim());
    if (data.description && data.description.trim()) {
      formData.append("description", data.description.trim());
    }
    if (data.category && data.category.trim()) {
      formData.append("category", data.category.trim());
    }
    formData.append("file", data.file);

    const response = await api.post<DocumentUploadResponse>(
      "/documents/upload",
      formData,
      {
        headers: {
          // Let Axios and browser handle boundary automatically
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );
    return response.data;
  },

  async updateDocument(
    documentId: string,
    data: DocumentUpdateRequest
  ): Promise<Document> {
    const response = await api.patch<Document>(
      `/documents/${documentId}`,
      data
    );
    return response.data;
  },

  async deleteDocument(documentId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/documents/${documentId}`
    );
    return response.data;
  },

  async processDocument(
    documentId: string
  ): Promise<DocumentProcessResponse> {
    const response = await api.post<DocumentProcessResponse>(
      `/documents/${documentId}/process`
    );
    return response.data;
  },

  async publishDocument(
    documentId: string
  ): Promise<DocumentPublishResponse> {
    const response = await api.post<DocumentPublishResponse>(
      `/documents/${documentId}/publish`
    );
    return response.data;
  },
};

export default documentService;

