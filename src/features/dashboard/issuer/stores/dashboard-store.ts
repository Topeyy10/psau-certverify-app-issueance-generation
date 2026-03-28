// features/dashboard/lib/stores/dashboard-store.ts

import { create } from "zustand";
import type { DocumentResponse, HealthResponse } from "@/aactions/shared/types";
import type { Template, TemplateData } from "@/types";

interface DashboardState {
  templates: Template[];
  totalTemplates: DocumentResponse | null;
  issued: DocumentResponse | null;
  pending: DocumentResponse | null;
  health: HealthResponse | null;
  setDashboard: (data: {
    templates: TemplateData;
    metrics: {
      templatesCount: DocumentResponse;
      issued: DocumentResponse;
      pending: DocumentResponse;
      health: HealthResponse;
    };
  }) => void;
  deleteTemplate: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  templates: [],
  totalTemplates: null,
  issued: null,
  pending: null,
  health: null,
  setDashboard: ({ templates, metrics }) =>
    set({
      templates: templates.templates,
      totalTemplates: metrics.templatesCount,
      issued: metrics.issued,
      pending: metrics.pending,
      health: metrics.health,
    }),
  deleteTemplate: (id) =>
    set((state) => {
      let updatedTotalTemplates = state.totalTemplates;
      if (
        updatedTotalTemplates &&
        "data" in updatedTotalTemplates &&
        updatedTotalTemplates.data &&
        typeof updatedTotalTemplates.data.total === "number"
      ) {
        updatedTotalTemplates = {
          ...updatedTotalTemplates,
          data: {
            ...updatedTotalTemplates.data,
            total: Math.max(0, updatedTotalTemplates.data.total - 1),
          },
        };
      }
      return {
        templates: state.templates.filter((t) => t.id !== id),
        totalTemplates: updatedTotalTemplates,
      };
    }),
}));
