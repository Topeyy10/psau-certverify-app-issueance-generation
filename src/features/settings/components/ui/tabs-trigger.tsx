"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "../../lib/stores/use-settings-store";

const Trigger = ({
  disabled,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) => {
  const isLoading = useSettingsStore((s) => s.isLoading);

  return <TabsTrigger disabled={disabled || isLoading} {...props} />;
};

export { Trigger as TabsTrigger };
