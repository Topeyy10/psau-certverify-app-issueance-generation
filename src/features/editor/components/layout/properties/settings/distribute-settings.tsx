import type { ActiveSelection } from "fabric";
import {
  AlignHorizontalDistributeCenterIcon,
  AlignVerticalDistributeCenterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import { isActiveSelection } from "@/features/editor/lib/types";
import { onDistributeObjects } from "@/features/editor/lib/utils";

const DistributeSettings = () => {
  const showDistributeSettings = useCanvasStore((s) => {
    const selectedObject = s.objects;

    // Check for a selection of 2 or more objects
    if (isActiveSelection(selectedObject)) {
      return (selectedObject as ActiveSelection).getObjects().length > 2;
    }
  });

  if (!showDistributeSettings) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Distribution</Label>
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          onClick={() => onDistributeObjects("vertical")}
        >
          <AlignVerticalDistributeCenterIcon />
          Vertically
        </Button>

        <Button
          variant="outline"
          onClick={() => onDistributeObjects("horizontal")}
        >
          <AlignHorizontalDistributeCenterIcon />
          Horizontally
        </Button>
      </div>
    </div>
  );
};

export { DistributeSettings };
