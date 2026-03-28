"use client";

import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogsActions, useLogsState } from "../../context/logs-provider";

const LogsTableHeader = () => {
  const { fetchData } = useLogsActions();
  const { loading } = useLogsState();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h3 className="text-2xl font-bold">System Logs</h3>
        <p className="text-muted-foreground mt-1">
          Review all operational events and actions within the system.
        </p>
      </div>
      <Button size="lg" onClick={fetchData} disabled={loading}>
        <RotateCcwIcon /> Refresh
      </Button>
    </div>
  );
};

export { LogsTableHeader };
