import type { LucideIcon } from "lucide-react";
import type { DocumentResponse, HealthResponse } from "@/aactions/shared/types";

export type WidgetState = "loading" | "success" | "error";

export interface WidgetCardProps<T> {
  icon?: LucideIcon;
  initialData?: T | null;
  pollInterval?: number;
  title: string;
  transparent?: boolean;

  fetchData: () => Promise<T>;
  renderData: (data: T, loading: boolean) => React.ReactNode;
}

export type AnyWidgetCard =
  | WidgetCardProps<DocumentResponse>
  | WidgetCardProps<HealthResponse>;

export interface StatusData {
  health: string;
  description: string;
  timestamp: Date;
  ping: number;
}

export type IssuerWidgets = {
  issuedCertificates: DocumentResponse | null;
  pendingCertificates: DocumentResponse | null;
  revokedCertificates: DocumentResponse | null;
  health: HealthResponse | null;
};
