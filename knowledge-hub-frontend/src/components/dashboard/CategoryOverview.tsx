import React from "react";
import { FolderTree } from "lucide-react";
import type { CategoryDistribution } from "../../types/dashboard";

interface CategoryOverviewProps {
  categories: CategoryDistribution[];
  isLoading?: boolean;
}

export const CategoryOverview: React.FC<CategoryOverviewProps> = ({
  categories,
  isLoading = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Category Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Document representation across departments
          </p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-500">
          <FolderTree className="h-4 w-4" />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-3.5 w-8 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            No category distribution available yet.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3.5">
          {categories.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800">
                  {cat.category}
                </span>
                <span className="text-slate-500">
                  {cat.count} {cat.count === 1 ? "doc" : "docs"} (
                  {cat.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryOverview;

