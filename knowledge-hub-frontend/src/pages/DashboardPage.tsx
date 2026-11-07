import React, { useState, useMemo } from "react";
import {
  Files,
  Globe2,
  Clock,
  FolderTree,
  FileUp,
  RotateCcw,
} from "lucide-react";
import useDocuments from "../hooks/useDocuments";
import dashboardService from "../services/dashboardService";
import StatCard from "../components/dashboard/StatCard";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import CategoryOverview from "../components/dashboard/CategoryOverview";
import DocumentDetailsDialog from "../components/documents/DocumentDetailsDialog";
import DocumentUploadDialog from "../components/documents/DocumentUploadDialog";
import { useToast } from "../context/ToastContext";
import type { Document } from "../types/document";

export const DashboardPage: React.FC = () => {
  const {
    documents,
    isLoading,
    refreshDocuments,
    uploadDocument,
    processDocument,
    publishDocument,
  } = useDocuments();

  const { success, error } = useToast();

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Compute live KPI stats from actual documents
  const stats = useMemo(
    () => dashboardService.calculateStats(documents),
    [documents]
  );

  // Compute live category distribution from actual documents
  const categoryDistribution = useMemo(
    () => dashboardService.calculateCategoryDistribution(documents),
    [documents]
  );

  const handleViewDetails = (doc: Document) => {
    setSelectedDoc(doc);
    setIsDetailsOpen(true);
  };

  const handleProcess = async (doc: Document) => {
    setIsProcessing(true);
    try {
      const res = await processDocument(doc.id);
      success(
        "Document Processed",
        `Generated ${res.total_chunks} vector chunks across ${res.total_pages} page(s). Ready to publish!`
      );
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(res.document);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Processing failed.";
      error("Processing Failed", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async (doc: Document) => {
    setIsPublishing(true);
    try {
      const res = await publishDocument(doc.id);
      success(
        "Published Successfully",
        `"${doc.title}" is now live in the AI Kiosk knowledge retrieval index.`
      );
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(res.document);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publishing failed.";
      error("Publishing Failed", msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpload = async (data: {
    title: string;
    description?: string;
    category?: string;
    file: File;
  }) => {
    const res = await uploadDocument(data);
    success(
      "Document Uploaded",
      `"${res.document.title}" uploaded successfully. Status: ${res.document.status}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Knowledge Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of university documentation and Kiosk retrieval
            embeddings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshDocuments}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
          >
            <FileUp className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Documents */}
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          description="Managed university source documents"
          icon={Files}
          isLoading={isLoading}
          accentColor="blue"
        />

        {/* Card 2: Published Documents */}
        <StatCard
          title="Published to Kiosk"
          value={stats.publishedDocuments}
          description="Live in RAG vector index"
          icon={Globe2}
          isLoading={isLoading}
          accentColor="emerald"
        />

        {/* Card 3: Pending Processing */}
        <StatCard
          title="Pending Processing"
          value={stats.pendingDocuments}
          description="Uploaded or actively chunking"
          icon={Clock}
          isLoading={isLoading}
          accentColor="amber"
        />

        {/* Card 4: Categories */}
        <StatCard
          title="Active Categories"
          value={stats.categoryCount}
          description="Represented university domains"
          icon={FolderTree}
          isLoading={isLoading}
          accentColor="indigo"
        />
      </div>

      {/* Main Content Split: Recent Documents (2/3) + Category Distribution (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDocuments
            documents={documents}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onProcess={handleProcess}
            onPublish={handlePublish}
          />
        </div>

        <div className="lg:col-span-1">
          <CategoryOverview
            categories={categoryDistribution}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Document Details Dialog */}
      <DocumentDetailsDialog
        document={selectedDoc}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onProcess={handleProcess}
        onPublish={handlePublish}
        isProcessing={isProcessing}
        isPublishing={isPublishing}
      />

      {/* Upload Document Dialog */}
      <DocumentUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default DashboardPage;
