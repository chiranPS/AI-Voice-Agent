import React from "react";
import type { DocumentStatus } from "../../types/document";
import {
  Clock,
  Loader2,
  CheckCircle2,
  Globe2,
  AlertCircle,
  Archive,
} from "lucide-react";

interface DocumentStatusBadgeProps {
  status: DocumentStatus | string;
  size?: "sm" | "md";
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const normalizedStatus = status.toLowerCase() as DocumentStatus;

  const config = {
    uploaded: {
      label: "Uploaded",
      icon: Clock,
      className: "bg-slate-100 text-slate-700 border-slate-200",
      dotColor: "bg-slate-400",
    },
    processing: {
      label: "Processing",
      icon: Loader2,
      className: "bg-amber-50 text-amber-700 border-amber-200",
      dotColor: "bg-amber-500 animate-spin",
    },
    processed: {
      label: "Processed",
      icon: CheckCircle2,
      className: "bg-blue-50 text-blue-700 border-blue-200",
      dotColor: "bg-blue-500",
    },
    published: {
      label: "Published",
      icon: Globe2,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotColor: "bg-emerald-500",
    },
    failed: {
      label: "Failed",
      icon: AlertCircle,
      className: "bg-rose-50 text-rose-700 border-rose-200",
      dotColor: "bg-rose-500",
    },
    archived: {
      label: "Archived",
      icon: Archive,
      className: "bg-zinc-100 text-zinc-600 border-zinc-200",
      dotColor: "bg-zinc-400",
    },
  }[normalizedStatus] || {
    label: status,
    icon: Clock,
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
  };

  const Icon = config.icon;
  const isSpinning = normalizedStatus === "processing";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        config.className
      } ${
        size === "sm"
          ? "px-2.5 py-0.5 text-[11px]"
          : "px-3 py-1 text-xs"
      }`}
    >
      <Icon className={`h-3 w-3 shrink-0 ${isSpinning ? "animate-spin" : ""}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default DocumentStatusBadge;

