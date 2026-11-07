export interface DashboardStats {
  totalDocuments: number;
  publishedDocuments: number;
  pendingDocuments: number;
  categoryCount: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

