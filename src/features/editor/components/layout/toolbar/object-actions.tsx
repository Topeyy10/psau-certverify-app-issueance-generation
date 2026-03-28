import { CopyIcon, Trash2Icon } from "lucide-react";
import { useCanvasStore } from "@/features/editor/lib/stores";
import { onDeleteObject, onDuplicateObject } from "@/features/editor/lib/utils";
import { ToolButton } from "../../controls/tool-button";

const ObjectActions = () => {
  const hasActiveObject = useCanvasStore((s) => !!s.objects);

  return (
    <>
      <ToolButton
        title="Duplicate"
        size="icon"
        className="size-8"
        disabled={!hasActiveObject}
        onClick={() => onDuplicateObject()}
      >
        <CopyIcon className="size-4" />
      </ToolButton>
      <ToolButton
        title="Delete"
        variant="destructive"
        size="icon"
        className="size-8"
        disabled={!hasActiveObject}
        onClick={onDeleteObject}
      >
        <Trash2Icon className="size-4" />
      </ToolButton>
    </>
  );
};

export { ObjectActions };
