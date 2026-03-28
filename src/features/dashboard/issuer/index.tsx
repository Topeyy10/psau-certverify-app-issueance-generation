import { IssuerMetrics } from "./components/issuer-metrics";
import { TemplateManager } from "./components/manager";

const IssuerDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <IssuerMetrics />
      <TemplateManager />
    </div>
  );
};

export { IssuerDashboard };
