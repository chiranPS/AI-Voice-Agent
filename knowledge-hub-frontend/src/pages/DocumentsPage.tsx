import React, { useState, useMemo } from "react";
import { FileUp } from "lucide-react";
import useDocuments from "../hooks/useDocuments";
import DocumentTable from "../components/documents/DocumentTable";
import DocumentFilters from "../components/documents/DocumentFilters";
import DocumentUploadDialog from "../components/documents/DocumentUploadDialog";
import DocumentDetailsDialog from "../components/documents/DocumentDetailsDialog";
import DocumentEditDialog from "../components/documents/DocumentEditDialog";
import DocumentDeleteDialog from "../components/documents/DocumentDeleteDialog";
import { useToast } from "../context/ToastContext";
import type { Document } from "../types/document";

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    isLoading,
    error: apiError,
    refreshDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    processDocument,
    publishDocument,
  } = useDocuments();

  const { success, error, info } = useToast();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected Document for Dialogs
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // In-flight Action Sets to prevent duplicate clicks
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());

  // Distinct categories present in actual documents
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(
        documents
          .map((d) => d.category?.trim())
          .filter((c): c is string => Boolean(c && c.length > 0))
      )
    );
  }, [documents]);

  // Combined Filtering: Title Search + Category Filter + Status Filter
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Title Search (case-insensitive)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesFilename = doc.file_name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesFilename) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== "all") {
        const docCat = doc.category?.trim() || "Other";
        if (docCat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Status Filter
      if (selectedStatus !== "all") {
        if (doc.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [documents, searchQuery, selectedCategory, selectedStatus]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  // Handlers for Document Operations
  const handleUpload = async (data: {
    title: string;
    description?: string;
    category?: string;
    file: File;
  }) => {
    const res = await uploadDocument(data);
    success(
      "Document Uploaded",
      `"${res.document.title}" was uploaded successfully. Status: ${res.document.status}.`
    );
  };

  const handleEdit = async (
    id: string,
    data: { title: string; description?: string; category?: string }
  ) => {
    try {
      const updated = await updateDocument(id, data);
      success(
        "Metadata Updated",
        `Document details for "${updated.title}" have been updated.`
      );
      if (selectedDoc?.id === id) {
        setSelectedDoc(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update metadata.";
      error("Update Failed", msg);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      success("Document Deleted", "Document and its vectors were permanently removed.");
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete document.";
      error("Delete Failed", msg);
      throw err;
    }
  };

  const handleProcess = async (doc: Document) => {
    if (processingIds.has(doc.id)) return;

    setProcessingIds((prev) => new Set(prev).add(doc.id));
    info("Processing Document", `Extracting content & generating embeddings for "${doc.title}"...`);

    try {
      const res = await processDocument(doc.id);
      success(
        "Processing Complete",
        `Created ${res.total_chunks} chunks across ${res.total_pages} page(s). Ready for publication!`
      );
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(res.document);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document processing failed.";
      error("Processing Failed", msg);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  };

  const handlePublish = async (doc: Document) => {
    if (publishingIds.has(doc.id)) return;

    setPublishingIds((prev) => new Set(prev).add(doc.id));

    try {
      const res = await publishDocument(doc.id);
      success(
        "Published to Kiosk",
        `"${doc.title}" is now active in the university AI Voice Agent knowledge base.`
      );
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(res.document);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish document.";
      error("Publishing Failed", msg);
    } finally {
      setPublishingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Knowledge Documents
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, process, and publish university reference documents for the
            AI Kiosk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
        >
          <FileUp className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        availableCategories={availableCategories}
        onClearFilters={handleClearFilters}
        onRefresh={refreshDocuments}
        isRefreshing={isLoading}
      />

      {/* Active Filter Summary Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing{" "}
          <strong className="text-slate-900 font-semibold">
            {filteredDocuments.length}
          </strong>{" "}
          of{" "}
          <strong className="text-slate-900 font-semibold">
            {documents.length}
          </strong>{" "}
          {documents.length === 1 ? "document" : "documents"}
        </span>

        {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
          <span className="text-[11px] text-blue-600 font-medium">
            Active filters applied
          </span>
        )}
      </div>

      {/* Document Listing Table */}
      <DocumentTable
        documents={filteredDocuments}
        isLoading={isLoading}
        error={apiError}
        onViewDetails={(doc) => {
          setSelectedDoc(doc);
          setIsDetailsOpen(true);
        }}
        onEdit={(doc) => {
          setSelectedDoc(doc);
          setIsEditOpen(true);
        }}
        onDelete={(doc) => {
          setSelectedDoc(doc);
          setIsDeleteOpen(true);
        }}
        onProcess={handleProcess}
        onPublish={handlePublish}
        onOpenUpload={() => setIsUploadOpen(true)}
        processingIds={processingIds}
        publishingIds={publishingIds}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      {/* Details Dialog */}
      <DocumentDetailsDialog
        document={selectedDoc}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={(doc) => {
          setSelectedDoc(doc);
          setIsEditOpen(true);
        }}
        onDelete={(doc) => {
          setSelectedDoc(doc);
          setIsDeleteOpen(true);
        }}
        onProcess={handleProcess}
        onPublish={handlePublish}
        isProcessing={selectedDoc ? processingIds.has(selectedDoc.id) : false}
        isPublishing={selectedDoc ? publishingIds.has(selectedDoc.id) : false}
      />

      {/* Edit Metadata Dialog */}
      <DocumentEditDialog
        document={selectedDoc}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DocumentDeleteDialog
        document={selectedDoc}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DocumentsPage;
