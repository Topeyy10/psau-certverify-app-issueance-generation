import {
  ChevronDownIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { onLayerChange } from "@/features/editor/lib/utils";

const LayerControls = () => {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Layer</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => onLayerChange("bringObjectToFront")}
        >
          <ChevronsUpIcon />
          To Front
        </Button>
        <Button
          variant="outline"
          onClick={() => onLayerChange("sendObjectToBack")}
        >
          <ChevronsDownIcon />
          To Back
        </Button>
        <Button
          variant="outline"
          onClick={() => onLayerChange("bringObjectForward")}
        >
          <ChevronUpIcon />
          Forward
        </Button>
        <Button
          variant="outline"
          onClick={() => onLayerChange("sendObjectBackwards")}
        >
          <ChevronDownIcon />
          Backward
        </Button>
      </div>
    </div>
  );
};

export { LayerControls };
