import type {
  CPUResponse,
  CpuState,
  DocumentResponse,
  HealthResponse,
  MemoryResponse,
  MemoryState,
  UsersResponse,
} from "@/aactions/shared/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WidgetLoading } from "../components/widget-card";

export const renderHealthCard = (
  data: HealthResponse & { description: string },
  loading: boolean,
) => {
  if (loading || !data) return <WidgetLoading />;
  if (!data.ok) return null;

  const res = data.data;

  return (
    <>
      <div className="text-card-foreground mb-1 text-2xl font-bold capitalize">
        {res.health}
      </div>
      <p className="text-card-foreground/60 text-xs">
        {data.description}:{" "}
        {res.timestamp && new Date(res.timestamp).toLocaleTimeString()}
      </p>
    </>
  );
};

export const renderDataCard = (
  data: ((DocumentResponse | UsersResponse) & { description: string }) | null,
  loading: boolean,
) => {
  if (loading || !data) return <WidgetLoading />;
  if (!data.ok) return null;

  const res = data.data;

  return (
    <>
      <div className="text-card-foreground mb-1 text-2xl font-bold">
        {res?.total ?? "N/A"}
      </div>
      <p className="text-card-foreground/60 text-xs">{data.description}</p>
    </>
  );
};

export const renderMemoryCard = (
  data: (MemoryResponse & { description: string }) | null,
  _loading: boolean,
) => {
  const res: MemoryState = data?.ok
    ? data.data.memory
    : {
        totalMem: 0,
        freeMem: 0,
        usedMem: 0,
        memoryUsagePercent: 0,
        status: "Unknown",
      };

  const usage = Math.round(res.memoryUsagePercent * 10000) / 100;

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-foreground">{usage}%</span>
        <Badge>{res.status}</Badge>
      </div>
      <p className="text-card-foreground/60 text-xs">
        {(res.usedMem / (1024 * 1024 * 1024)).toFixed(2)} GB /{" "}
        {(res.totalMem / (1024 * 1024 * 1024)).toFixed(2)} GB
      </p>

      <Progress value={usage} className="mt-3 h-2" />
    </div>
  );
};

export const renderCPUCard = (
  data: (CPUResponse & { description: string }) | null,
  _loading: boolean,
) => {
  const res: CpuState = data?.ok
    ? data.data.cpu
    : {
        coreCount: "0",
        usagePercent: 0,
        cpuSpeedMhz: 0,
        status: "Unknown",
      };
  const usage = Math.round(res.usagePercent * 10000) / 100;

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-foreground">{usage}%</span>
        <Badge>{res.status}</Badge>
      </div>
      <p className="text-card-foreground/60 text-xs">
        {res.coreCount} cores @ {res.cpuSpeedMhz} MHz
      </p>

      <Progress value={usage} className="mt-3 h-2" />
    </div>
  );
};
