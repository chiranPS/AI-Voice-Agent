import { useState, useEffect, useCallback } from "react";
import documentService from "../services/documentService";
import { getErrorMessage } from "../services/api";
import type {
  Document,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentProcessResponse,
  DocumentPublishResponse,
} from "../types/document";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (data: DocumentUploadRequest) => {
    const res = await documentService.uploadDocument(data);
    await fetchDocuments();
    return res;
  };

  const updateDocument = async (
    id: string,
    data: DocumentUpdateRequest
  ) => {
    const res = await documentService.updateDocument(id, data);
    await fetchDocuments();
    return res;
  };

  const deleteDocument = async (id: string) => {
    const res = await documentService.deleteDocument(id);
    await fetchDocuments();
    return res;
  };

  const processDocument = async (
    id: string
  ): Promise<DocumentProcessResponse> => {
    const res = await documentService.processDocument(id);
    await fetchDocuments();
    return res;
  };

  const publishDocument = async (
    id: string
  ): Promise<DocumentPublishResponse> => {
    const res = await documentService.publishDocument(id);
    await fetchDocuments();
    return res;
  };

  return {
    documents,
    isLoading,
    error,
    refreshDocuments: fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    processDocument,
    publishDocument,
  };
}

export default useDocuments;

