"use client";

import { useQuery } from "@tanstack/react-query";

interface Widget {
  id: string;
  type: "stat-card" | "chart" | "table" | "text-block" | "list" | "progress";
  title: string;
  span?: number;
  config: Record<string, unknown>;
}

interface Section {
  id: string;
  title: string;
  columns: number;
  order: number;
  widgets: Widget[];
}

export interface DashboardConfig {
  _id: string;
  projectId: string;
  pageTitle: string;
  sections: Section[];
  updatedAt: string;
}

export function useDashboardConfig(slug: string) {
  return useQuery<DashboardConfig>({
    queryKey: ["projects", slug, "dashboard-config"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/dashboard-config`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Admin access required");
        throw new Error("Failed to fetch dashboard config");
      }
      return res.json();
    },
    enabled: !!slug,
  });
}
