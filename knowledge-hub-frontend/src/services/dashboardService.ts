import type { Document } from "../types/document";
import type {
  DashboardStats,
  CategoryDistribution,
} from "../types/dashboard";

export const dashboardService = {
  calculateStats(documents: Document[]): DashboardStats {
    const totalDocuments = documents.length;
    const publishedDocuments = documents.filter(
      (d) => d.status === "published"
    ).length;
    const pendingDocuments = documents.filter(
      (d) => d.status === "uploaded" || d.status === "processing"
    ).length;

    const uniqueCategories = new Set(
      documents
        .map((d) => d.category?.trim())
        .filter((c): c is string => Boolean(c && c.length > 0))
    );

    return {
      totalDocuments,
      publishedDocuments,
      pendingDocuments,
      categoryCount: uniqueCategories.size,
    };
  },

  calculateCategoryDistribution(
    documents: Document[]
  ): CategoryDistribution[] {
    if (documents.length === 0) return [];

    const counts: Record<string, number> = {};

    documents.forEach((d) => {
      const cat = d.category?.trim() || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = documents.length;

    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  },
};

export default dashboardService;

