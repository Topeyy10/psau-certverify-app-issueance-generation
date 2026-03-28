"use client";

import { useState } from "react";
import type { SystemLog } from "@/aactions/shared/types";
import { TablePagination } from "@/components/shared/data-table-pagination";
import { useLogsActions, useLogsState } from "../../context/logs-provider";
import { PreviewLogsDialog } from "../../dialog/preview-log";
import { LogsTable } from "./logs-table";
import { LogsTableHeader } from "./logs-table-header";

const SystemLogsTable = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const { page, pageSize, total, loading, lastFetch } = useLogsState();
  const { setPage, setPageSize } = useLogsActions();

  return (
    <div className="space-y-4">
      <LogsTableHeader />
      <div>
        {lastFetch && (
          <p className="text-sm text-muted-foreground text-right">
            Last update: {new Date(lastFetch).toLocaleTimeString()}
          </p>
        )}
        <LogsTable onRowClick={setSelectedLog} />
      </div>
      <TablePagination
        page={page}
        total={total}
        pageSize={pageSize}
        loading={loading}
        setPage={setPage}
        setPageSize={setPageSize}
      />
      <PreviewLogsDialog
        selectedLog={selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
};

export { SystemLogsTable };
