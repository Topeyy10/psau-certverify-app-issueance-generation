"use client";

import { Button } from "@/components/ui/button";
import { useData } from "../../lib/contexts/data-provider";
import { useAppActions } from "../../lib/hooks";

const ResetMappings = () => {
  const { state } = useData();
  const { resetMappings } = useAppActions();

  if (state.mode === "manual") return null;

  return (
    <Button onClick={resetMappings} className="w-full">
      Reset Mappings
    </Button>
  );
};

export { ResetMappings };
