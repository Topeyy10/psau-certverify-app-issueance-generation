import { AdminMetrics } from "./components/admin-metrics";
import { SystemLogsTable } from "./components/logs";
import { SystemInfoMetrics } from "./components/system-information";
import { LogsProvider } from "./context/logs-provider";

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <AdminMetrics />
      <SystemInfoMetrics />
      <LogsProvider>
        <SystemLogsTable />
      </LogsProvider>
    </div>
  );
};

export { AdminDashboard };
