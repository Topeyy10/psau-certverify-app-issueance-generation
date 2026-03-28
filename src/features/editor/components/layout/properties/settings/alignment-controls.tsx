import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OBJECT_ALIGNMENTS } from "@/features/editor/lib/constants";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import {
  isActiveSelection,
  type ObjectPosition,
} from "@/features/editor/lib/types";
import {
  onAlignMultipleObject,
  onAlignSingleObject,
} from "@/features/editor/lib/utils";

const AlignmentControls = () => {
  const handleAlign = useCallback((position: ObjectPosition) => {
    const { objects } = useCanvasStore.getState();
    if (!objects) return;

    if (!isActiveSelection(objects)) {
      onAlignSingleObject(position);
    } else {
      onAlignMultipleObject(position);
    }
  }, []);

  const HorizontalButtons = useMemo(
    () =>
      OBJECT_ALIGNMENTS.slice(0, 3).map(({ position, icon: Icon, label }) => (
        <Button
          key={position}
          variant="outline"
          onClick={() => handleAlign(position)}
        >
          <Icon /> {label}
        </Button>
      )),
    [handleAlign],
  );

  const VerticalButtons = useMemo(
    () =>
      OBJECT_ALIGNMENTS.slice(3).map(({ position, icon: Icon, label }) => (
        <Button
          key={position}
          variant="outline"
          onClick={() => handleAlign(position)}
        >
          <Icon /> {label}
        </Button>
      )),
    [handleAlign],
  );

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Alignment</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">{HorizontalButtons}</div>
        <div className="flex flex-col gap-2">{VerticalButtons}</div>
      </div>
    </div>
  );
};

export { AlignmentControls };
