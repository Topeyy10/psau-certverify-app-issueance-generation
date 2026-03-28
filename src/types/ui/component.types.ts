import type { LucideIcon } from "lucide-react";

export interface RouteLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface Meta {
  icon: LucideIcon;
  title: string;
  description: string;
}

export type Metadata = Record<string, Meta>;
