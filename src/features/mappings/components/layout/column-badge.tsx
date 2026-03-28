import { GripVerticalIcon } from "lucide-react";
import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

const DraggableColumn = memo<{ column: string }>(({ column }) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", column);
      e.dataTransfer.effectAllowed = "copy";
    },
    [column],
  );

  return (
    <Badge
      className="cursor-grab active:cursor-grabbing rounded-sm"
      draggable
      onDragStart={handleDragStart}
    >
      <GripVerticalIcon className="size-3" />
      {column}
    </Badge>
  );
});

export { DraggableColumn };
