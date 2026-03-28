import type { ActiveSelection } from "fabric";
import { Badge } from "@/components/ui/badge";
import { useCanvasStore } from "../../lib/stores/canvas-store";
import { isActiveSelection, type Placeholder } from "../../lib/types";

const ObjectTypeBadge = () => {
  const activeLabel = useCanvasStore((s) => {
    const obj = s.objects;

    if (!obj) return "";

    // Handle placeholder case
    if ((obj as Placeholder).isPlaceholder) {
      return "placeholder";
    }

    // ActiveSelection case (multiple objects selected)
    if (isActiveSelection(obj)) {
      const count = (obj as ActiveSelection).getObjects().length;
      return `${count} objects`;
    }

    // Fall back gracefully if type is missing
    return obj.type ? obj.type.toLowerCase() : "object";
  });

  return (
    <Badge variant="secondary" className="font-normal capitalize">
      {activeLabel}
    </Badge>
  );
};

export { ObjectTypeBadge };
