import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  isLoading?: boolean;
  accentColor?: "blue" | "emerald" | "amber" | "indigo";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  isLoading = false,
  accentColor = "blue",
}) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  }[accentColor];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-3.5 w-36 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${colorStyles}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default StatCard;

