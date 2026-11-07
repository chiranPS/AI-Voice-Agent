import React from "react";
import {
  X,
  FileText,
  Calendar,
  Layers,
  HardDrive,
  Globe2,
  Play,
  Trash2,
  Edit2,
} from "lucide-react";
import type { Document } from "../../types/document";
import DocumentStatusBadge from "./DocumentStatusBadge";
import { formatDate } from "../../utils/formatDate";
import { formatFileSize } from "../../utils/formatFileSize";

interface DocumentDetailsDialogProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onProcess?: (doc: Document) => void;
  onPublish?: (doc: Document) => void;
  isProcessing?: boolean;
  isPublishing?: boolean;
}

export const DocumentDetailsDialog: React.FC<DocumentDetailsDialogProps> = ({
  document,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onProcess,
  onPublish,
  isProcessing = false,
  isPublishing = false,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {document.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {document.file_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5">
          {/* Status & Category Bar */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Knowledge Status
              </p>
              <div className="mt-1">
                <DocumentStatusBadge status={document.status} size="md" />
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Category
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-800">
                {document.category || "General Information"}
              </p>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </p>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {document.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* File Format */}
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-3">
              <Layers className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Format</p>
                <p className="font-semibold text-slate-800 uppercase">
                  {document.file_type}
                </p>
              </div>
            </div>

            {/* File Size */}
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-3">
              <HardDrive className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">File Size</p>
                <p className="font-semibold text-slate-800">
                  {formatFileSize(document.file_size)}
                </p>
              </div>
            </div>

            {/* Uploaded Date */}
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-3">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Uploaded At</p>
                <p className="font-semibold text-slate-800">
                  {formatDate(document.created_at)}
                </p>
              </div>
            </div>

            {/* Published / Updated Date */}
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-3">
              <Globe2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {document.published_at ? "Published At" : "Last Updated"}
                </p>
                <p className="font-semibold text-slate-800">
                  {document.published_at
                    ? formatDate(document.published_at)
                    : formatDate(document.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(document);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(document);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Metadata</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(document.status === "uploaded" || document.status === "failed") &&
              onProcess && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    onClose();
                    onProcess(document);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Process Document</span>
                </button>
              )}

            {document.status === "processed" && onPublish && (
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => {
                  onClose();
                  onPublish(document);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Globe2 className="h-3.5 w-3.5" />
                <span>Publish to Kiosk</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsDialog;

