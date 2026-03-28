"use client";

import { CpuIcon, MemoryStickIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  CPUResponse,
  MemoryResponse,
  SystemState,
} from "@/aactions/shared/types";
import { getSystemMetrics } from "@/aactions/system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WidgetCard } from "../../shared/components/widget-card";
import type { WidgetCardProps } from "../../shared/types";
import { renderCPUCard, renderMemoryCard } from "../../shared/utils/widget";

const SystemInfoMetrics = () => {
  const [data, setData] = useState<SystemState | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getSystemMetrics("all");
      if (!res.ok) {
        setData(null);
        return;
      }
      setData(res.data as SystemState);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cpuCard: WidgetCardProps<CPUResponse> = {
    title: "CPU Usage",
    icon: CpuIcon,
    transparent: true,
    initialData: data?.cpu ? { ok: true, data: { cpu: data.cpu } } : null,
    pollInterval: 15 * 1000, // 15 seconds
    fetchData: async () =>
      (await getSystemMetrics("cpu")) as CPUResponse,
    renderData: (data: CPUResponse, loading: boolean) =>
      renderCPUCard({ ...data, description: "Last Update" }, loading),
  };

  const memoryCard: WidgetCardProps<MemoryResponse> = {
    title: "Memory Usage",
    icon: MemoryStickIcon,
    transparent: true,
    initialData: data?.memory
      ? { ok: true, data: { memory: data.memory } }
      : null,
    pollInterval: 15 * 1000, // 15 seconds
    fetchData: async () =>
      (await getSystemMetrics("memory")) as MemoryResponse,
    renderData: (data: MemoryResponse, loading: boolean) =>
      renderMemoryCard({ ...data, description: "Last Update" }, loading),
  };

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {data.system && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">Hostname</p>
              <p className="line-clamp-1">{data.system.hostname}</p>
            </div>

            <Separator />

            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">Platform</p>
              <p>{String(data.system.platform)}</p>
            </div>

            <Separator />

            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">Architecture</p>
              <p>{data.system.architecture}</p>
            </div>

            <Separator />

            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">CPU</p>
              <p>{data.system.cpuModel}</p>
            </div>

            <Separator />

            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">OS Release</p>
              <p>{data.system.release}</p>
            </div>

            <Separator />

            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">OS Type</p>
              <p>{data.system.type}</p>
            </div>

            <Separator />

            <div className="flex flex-col lg:flex-row lg:justify-between gap-x-4">
              <p className="text-muted-foreground">Username</p>
              <p>{data.system.userInfo.username}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {(data.memory || data.cpu) && (
        <div className="flex flex-col h-full justify-between gap-4">
          <WidgetCard<CPUResponse> {...cpuCard} />
          <WidgetCard<MemoryResponse> {...memoryCard} />
        </div>
      )}
    </div>
  );
};

export { SystemInfoMetrics };
