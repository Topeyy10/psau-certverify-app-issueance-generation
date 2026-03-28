"use client";

import {
  BadgeCheckIcon,
  ClockFadingIcon,
  SquareActivityIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getIssuedCertificatesCount,
  getPendingCertificatesCount,
  getRevokedCertificatesCount,
} from "@/aactions/certificates";
import type { DocumentResponse, HealthResponse } from "@/aactions/shared/types";
import { getHealth } from "@/aactions/system";
import { WidgetCard } from "../../shared/components/widget-card";
import type { IssuerWidgets, WidgetCardProps } from "../../shared/types";
import { renderDataCard, renderHealthCard } from "../../shared/utils/widget";

const IssuerMetrics = () => {
  const [initialData, setInitialData] = useState<IssuerWidgets | null>(null);

  const loadData = useCallback(() => {
    Promise.allSettled([
      getIssuedCertificatesCount(),
      getPendingCertificatesCount(),
      getRevokedCertificatesCount(),
      getHealth(),
    ])
      .then((results) => {
        const [issued, pending, revoked, health] = results;
        setInitialData({
          issuedCertificates:
            issued.status === "fulfilled" ? issued.value : null,
          pendingCertificates:
            pending.status === "fulfilled" ? pending.value : null,
          revokedCertificates:
            revoked.status === "fulfilled" ? revoked.value : null,
          health: health.status === "fulfilled" ? health.value : null,
        });
      })
      .catch(() => setInitialData(null));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const issuedCard: WidgetCardProps<DocumentResponse> = {
    title: "Issued Certificates",
    icon: BadgeCheckIcon,
    initialData: initialData?.issuedCertificates,
    fetchData: () => getIssuedCertificatesCount(true),
    renderData: (data: DocumentResponse, loading: boolean) =>
      renderDataCard(
        { ...data, description: "Certificates issued this month" },
        loading,
      ),
  };

  const pendingCard: WidgetCardProps<DocumentResponse> = {
    title: "Pending Certificates",
    icon: ClockFadingIcon,
    initialData: initialData?.pendingCertificates,
    fetchData: () => getPendingCertificatesCount(true),
    renderData: (data: DocumentResponse, loading: boolean) =>
      renderDataCard(
        { ...data, description: "Certificates awaiting approval" },
        loading,
      ),
  };

  const revokedCard: WidgetCardProps<DocumentResponse> = {
    title: "Revoked Certificates",
    icon: ClockFadingIcon,
    initialData: initialData?.revokedCertificates,
    fetchData: () => getRevokedCertificatesCount(true),

    renderData: (data: DocumentResponse, loading: boolean) =>
      renderDataCard(
        {
          ...data,
          description: "Certificates revoked (deletion pending)",
        },
        loading,
      ),
  };

  const healthCard: WidgetCardProps<HealthResponse> = {
    title: "System Status",
    icon: SquareActivityIcon,
    initialData: initialData?.health,
    pollInterval: 5 * 60 * 1000,
    fetchData: getHealth,
    renderData: (data: HealthResponse, loading: boolean) =>
      renderHealthCard({ ...data, description: "Last Update" }, loading),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <WidgetCard<DocumentResponse> {...issuedCard} />
      <WidgetCard<DocumentResponse> {...pendingCard} />
      <WidgetCard<DocumentResponse> {...revokedCard} />
      <WidgetCard<HealthResponse> {...healthCard} />
    </div>
  );
};
IssuerMetrics.displayName = "WidgetCards";

export { IssuerMetrics };
