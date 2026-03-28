import { SHAPE_ITEMS } from "@/features/editor/lib/constants/shapes";
import type { ShapeType } from "@/features/editor/lib/types";
import { ToolButton } from "../../controls/tool-button";

const ShapeButtons = ({
  onAddShape,
}: {
  onAddShape: (shape: ShapeType) => void;
}) => {
  return Object.entries(SHAPE_ITEMS).map(([key, { label, icon: Icon }]) => (
    <ToolButton
      key={key}
      title={label}
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => onAddShape(key as ShapeType)}
    >
      <Icon className="size-4" />
    </ToolButton>
  ));
};

export { ShapeButtons };
