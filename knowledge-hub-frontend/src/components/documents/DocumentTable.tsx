import React from "react";
import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  Play,
  Globe2,
  AlertCircle,
  FileUp,
} from "lucide-react";
import type { Document } from "../../types/document";
import DocumentStatusBadge from "./DocumentStatusBadge";
import { formatDateShort } from "../../utils/formatDate";
import { formatFileSize } from "../../utils/formatFileSize";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onProcess: (doc: Document) => void;
  onPublish: (doc: Document) => void;
  onOpenUpload: () => void;
  processingIds?: Set<string>;
  publishingIds?: Set<string>;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  error,
  onViewDetails,
  onEdit,
  onDelete,
  onProcess,
  onPublish,
  onOpenUpload,
  processingIds = new Set(),
  publishingIds = new Set(),
}) => {
  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
        <h4 className="text-sm font-semibold text-rose-900">
          Failed to load documents
        </h4>
        <p className="mt-1 text-xs text-rose-600 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
            >
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
          <FileUp className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          No documents found
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          No knowledge documents match your current filter criteria or none have
          been uploaded yet.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
        >
          <FileUp className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Document Title</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">File Type & Size</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Uploaded Date</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {documents.map((doc) => {
              const isProcessing = processingIds.has(doc.id);
              const isPublishing = publishingIds.has(doc.id);

              return (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Document Title & Original Filename */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <p className="font-semibold text-slate-900 truncate">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {doc.file_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                      {doc.category || "General"}
                    </span>
                  </td>

                  {/* File Type & Size */}
                  <td className="px-4 py-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase font-bold text-slate-700">
                        {doc.file_type}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    <DocumentStatusBadge status={doc.status} />
                  </td>

                  {/* Uploaded Date */}
                  <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                    {formatDateShort(doc.created_at)}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(doc)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="View Document Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit Metadata */}
                      <button
                        type="button"
                        onClick={() => onEdit(doc)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Edit Metadata"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Process action if uploaded or failed */}
                      {(doc.status === "uploaded" || doc.status === "failed") && (
                        <button
                          type="button"
                          onClick={() => onProcess(doc)}
                          disabled={isProcessing}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                          title="Extract text & generate vector embeddings"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}

                      {/* Publish action if processed */}
                      {doc.status === "processed" && (
                        <button
                          type="button"
                          onClick={() => onPublish(doc)}
                          disabled={isPublishing}
                          className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                          title="Publish to AI Kiosk Knowledge Retrieval"
                        >
                          <Globe2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(doc)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;

