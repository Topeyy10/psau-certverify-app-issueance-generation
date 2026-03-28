"use client";

import {
  BadgeCheckIcon,
  ClockFadingIcon,
  NotepadTextDashedIcon,
  SquareActivityIcon,
  Users2Icon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAllUsersCount } from "@/aactions/auth";
import { getAllIssuedCertificateCount } from "@/aactions/certificates";
import type {
  DocumentResponse,
  HealthResponse,
  UsersResponse,
} from "@/aactions/shared/types";
import { getHealth } from "@/aactions/system";
import { getAllTemplatesCount } from "@/aactions/template";
import { WidgetCard } from "../../shared/components/widget-card";
import { useRefreshStore } from "../../shared/stores/refresh-store";
import type { WidgetCardProps } from "../../shared/types";
import { renderDataCard, renderHealthCard } from "../../shared/utils/widget";

// import { DocumentData } from "../../issuer/constants/metrics";

const AdminMetrics = () => {
  const version = useRefreshStore((s) => s.version);
  // const [initialData, setInitialData] = useState<DocumentData | null>(null);
  const [initialData, setInitialData] = useState<any | null>(null);

  const loadData = useCallback(() => {
    Promise.allSettled([
      getAllUsersCount(),
      getAllTemplatesCount(),
      getAllIssuedCertificateCount(),
      getHealth(),
    ])
      .then((results) => {
        const [users, templates, issued, health] = results;
        setInitialData({
          users: users.status === "fulfilled" ? users.value : null,
          templates: templates.status === "fulfilled" ? templates.value : null,
          issuedCertificates:
            issued.status === "fulfilled" ? issued.value : null,
          health: health.status === "fulfilled" ? health.value : null,
        });
      })
      .catch(() => setInitialData(null));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, version]);

  const usersCard: WidgetCardProps<UsersResponse> = {
    icon: Users2Icon,
    title: "All Users",
    initialData: initialData?.users,
    fetchData: () => getAllUsersCount(true),
    renderData: (data: UsersResponse, loading: boolean) =>
      renderDataCard(
        { ...data, description: "Currently registered users" },
        loading,
      ),
  };

  const templatesCard: WidgetCardProps<DocumentResponse> = {
    title: "Active Templates",
    icon: NotepadTextDashedIcon,
    initialData: initialData?.templates,
    fetchData: () => getAllTemplatesCount(true),
    renderData: (data: DocumentResponse, loading: boolean) =>
      renderDataCard(
        { ...data, description: "Templates ready to use" },
        loading,
      ),
  };

  const issuedCard: WidgetCardProps<DocumentResponse> = {
    title: "Issued Certificates",
    icon: BadgeCheckIcon,
    initialData: initialData?.issuedCertificates,
    fetchData: () => getAllIssuedCertificateCount(true),
    renderData: (data: DocumentResponse, loading: boolean) =>
      renderDataCard(
        { ...data, description: "Globally issued certificates" },
        loading,
      ),
  };

  const pendingCard: WidgetCardProps<DocumentResponse> = {
    title: "Pending Certificates",
    icon: ClockFadingIcon,
    initialData: initialData?.pendingCertificates,
    fetchData: () =>
      import("@/aactions/certificates").then((m) =>
        m.getPendingCertificatesCount(true),
      ),
    renderData: (data: DocumentResponse, loading: boolean) =>
      renderDataCard({ ...data, description: "Awaiting approval" }, loading),
  };

  const healthCard: WidgetCardProps<HealthResponse> = {
    title: "System Status",
    icon: SquareActivityIcon,
    initialData: initialData?.health,
    pollInterval: 5 * 60 * 1000,
    fetchData: () => import("@/aactions/system").then((m) => m.getHealth()),
    renderData: (data: HealthResponse, loading: boolean) =>
      renderHealthCard({ ...data, description: "Last Update" }, loading),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <WidgetCard<UsersResponse> {...usersCard} />
      <WidgetCard<DocumentResponse> {...templatesCard} />
      <WidgetCard<DocumentResponse> {...issuedCard} />
      <WidgetCard<HealthResponse> {...healthCard} />
    </div>
  );
};
AdminMetrics.displayName = "WidgetCards";

export { AdminMetrics };
