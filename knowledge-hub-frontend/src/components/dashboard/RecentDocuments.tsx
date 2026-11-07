import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, Eye, Play, Globe2 } from "lucide-react";
import type { Document } from "../../types/document";
import DocumentStatusBadge from "../documents/DocumentStatusBadge";
import { formatDateShort } from "../../utils/formatDate";
import { formatFileSize } from "../../utils/formatFileSize";

interface RecentDocumentsProps {
  documents: Document[];
  isLoading?: boolean;
  onViewDetails: (doc: Document) => void;
  onProcess?: (doc: Document) => void;
  onPublish?: (doc: Document) => void;
}

export const RecentDocuments: React.FC<RecentDocumentsProps> = ({
  documents,
  isLoading = false,
  onViewDetails,
  onProcess,
  onPublish,
}) => {
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Documents
          </h3>
          <p className="text-xs text-slate-500">
            Latest documents uploaded to the knowledge base
          </p>
        </div>

        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
        >
          <span>View All Documents</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
            >
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : recentDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            No documents uploaded yet
          </p>
          <p className="text-xs text-slate-500 max-w-sm mt-0.5">
            Upload your first university policy, handbook or academic document
            to get started.
          </p>
          <Link
            to="/documents"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            Upload Document
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Document Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type & Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {doc.file_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {doc.category || "General"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-500">
                    <span className="uppercase font-semibold text-slate-700 mr-1.5">
                      {doc.file_type}
                    </span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <DocumentStatusBadge status={doc.status} />
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDateShort(doc.created_at)}
                  </td>

                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(doc)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {(doc.status === "uploaded" || doc.status === "failed") &&
                        onProcess && (
                          <button
                            type="button"
                            onClick={() => onProcess(doc)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50 transition"
                            title="Process Document"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}

                      {doc.status === "processed" && onPublish && (
                        <button
                          type="button"
                          onClick={() => onPublish(doc)}
                          className="rounded p-1 text-emerald-600 hover:bg-emerald-50 transition"
                          title="Publish to Kiosk RAG"
                        >
                          <Globe2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentDocuments;

