import type {
  Template,
  TemplateMeta,
  TemplatesResponse,
} from "@/aactions/shared/types";

export type TemplateData = TemplatesResponse;
export type { Template, TemplateMeta };

export type TemplateId = Template["id"];

export interface TemplateActions {
  onUseTemplate: (id: Template["id"]) => void;
  onEditTemplate: (id: Template["id"]) => void;
  onViewProperties: (id: Template["id"]) => void;
  onDeleteTemplate: (id: Template["id"]) => void;
}

export interface Shortcut {
  key: string; // The key to press (e.g., 'Delete', 'd', 'a', 'Escape')
  fn: (event: KeyboardEvent) => void; // The function to execute
  hasCtrl?: boolean; // Default is false
  hasAlt?: boolean; // Default is false
  hasShift?: boolean; // Added for completeness
}
