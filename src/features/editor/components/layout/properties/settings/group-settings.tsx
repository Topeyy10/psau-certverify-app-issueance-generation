import type { ActiveSelection } from "fabric";
import { GroupIcon, UngroupIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import { isActiveSelection } from "@/features/editor/lib/types";
import { groupObjects, ungroupObjects } from "@/features/editor/lib/utils";

const GroupSettings = () => {
  const showGroupSettings = useCanvasStore((s) => {
    const selectedObject = s.objects;

    if (isActiveSelection(selectedObject)) {
      return (selectedObject as ActiveSelection).getObjects().length >= 2;
    }

    if (selectedObject && selectedObject.type.toLowerCase() === "group") {
      return true;
    }

    return false;
  });

  if (!showGroupSettings) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Grouping</Label>
      <div className="grid grid-cols-1 gap-2">
        <Button variant="outline" onClick={groupObjects}>
          <GroupIcon />
          Group
        </Button>

        <Button variant="outline" onClick={ungroupObjects}>
          <UngroupIcon />
          Ungroup
        </Button>
      </div>
    </div>
  );
};

export { GroupSettings };
