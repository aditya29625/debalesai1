"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Project {
  _id: string;
  name: string;
  slug: string;
  description: string;
  role: string;
}

interface Integration {
  name: string;
  enabled: boolean;
  type: "shopify" | "crm";
}

interface ProductInstance {
  _id: string;
  projectId: string;
  productType: string;
  nameSpace: string;
  displayName: string;
  integrations: Integration[];
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useProductInstance(slug: string) {
  return useQuery<ProductInstance>({
    queryKey: ["projects", slug, "product-instance"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/product-instance`);
      if (!res.ok) throw new Error("Failed to fetch product instance");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useIntegrations(slug: string) {
  return useQuery<Integration[]>({
    queryKey: ["projects", slug, "integrations"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/integrations`);
      if (!res.ok) throw new Error("Failed to fetch integrations");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useToggleIntegration(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ integrationName, enabled }: { integrationName: string; enabled: boolean }) => {
      const res = await fetch(`/api/projects/${slug}/integrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationName, enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle integration");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", slug, "integrations"] });
      qc.invalidateQueries({ queryKey: ["projects", slug, "product-instance"] });
    },
  });
}
