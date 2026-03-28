import { memo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import {
  type CustomPolygon,
  isLine,
  isPolygon,
  isShape,
} from "@/features/editor/lib/types";
import {
  updatePolygonPoints,
  useUpdateProperty,
} from "@/features/editor/lib/utils";
import { ColorInput } from "../../../controls/color-input";
import { PropertySlider } from "./shared";

/* ----------------------------- Color Controls ----------------------------- */
const ColorControls = memo(() => {
  const isLineObject = useCanvasStore((s) => isLine(s.objects));
  const fillColor = useCanvasStore((s) => s.objects?.fill ?? "#000000");
  const strokeColor = useCanvasStore((s) => s.objects?.stroke ?? "#000000");
  const updateFill = useUpdateProperty("fill");
  const updateStroke = useUpdateProperty("stroke");

  const handleFillChange = useCallback(
    (value: string) => updateFill(value),
    [updateFill],
  );
  const handleStrokeChange = useCallback(
    (value: string) => updateStroke(value),
    [updateStroke],
  );

  return (
    <>
      {!isLineObject && (
        <div className="space-y-1">
          <Label htmlFor="fillInput">Fill Color</Label>
          <ColorInput
            id="fillInput"
            value={fillColor as string}
            onChange={handleFillChange}
          />
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="strokeInput">Stroke Color</Label>
        <ColorInput
          id="strokeInput"
          value={strokeColor as string}
          onChange={handleStrokeChange}
        />
      </div>
    </>
  );
});

/* ----------------------------- Stroke Control ----------------------------- */
const StrokeWidthControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="strokeWidthInput">Stroke Width</Label>
    <PropertySlider
      id="strokeWidthInput"
      property="strokeWidth"
      selector={(s) => Math.round(s.objects?.strokeWidth ?? 0)}
      min={0}
      max={40}
      step={1}
      formatter={(value) => `${Math.round(value * 100)}%`}
      transformer={(value) => Math.round(value * 100) / 100}
    />
  </div>
));

/* ---------------------------- Polygon Controls ---------------------------- */
const PolygonSideControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="sidesInput">Sides</Label>
    <PropertySlider
      id="sidesInput"
      customHandler={(newSides, object) => {
        const polygon = object as CustomPolygon;
        return updatePolygonPoints(
          newSides,
          polygon.starInset,
          polygon.polygonType === "star",
        );
      }}
      selector={(s) => (s.objects as CustomPolygon)?.sides ?? 5}
      min={5}
      max={30}
      step={1}
      formatter={(v) => `${v}`}
    />
  </div>
));

const PolygonStarToggle = memo(() => {
  const isStar = useCanvasStore(
    (s) => (s.objects as CustomPolygon).polygonType === "star",
  );
  const update = useUpdateProperty();

  const handleToggleChange = useCallback(
    (isStar: boolean) => {
      const { objects } = useCanvasStore.getState();
      if (!objects) return;

      const polygon = objects as CustomPolygon;
      const property = updatePolygonPoints(
        polygon.sides,
        polygon.starInset,
        isStar,
      );
      update(property);
    },
    [update],
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor="starToggle">Star Polygon</Label>
      <Switch
        id="starToggle"
        checked={isStar}
        onCheckedChange={handleToggleChange}
      />
    </div>
  );
});

const PolygonInsetControl = memo(() => {
  const isStarPolygon = useCanvasStore(
    (s) =>
      isPolygon(s.objects) &&
      (s.objects as CustomPolygon).polygonType === "star",
  );

  if (!isStarPolygon) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="insetsInput">Insets</Label>
      <PropertySlider
        id="insetsInput"
        customHandler={(newInsets, object) => {
          const sides = (object as CustomPolygon).sides;
          return updatePolygonPoints(sides, newInsets, true);
        }}
        selector={(s) => (s.objects as CustomPolygon)?.starInset ?? 0.2}
        min={0}
        max={0.9}
        step={0.01}
        formatter={(v) => `${Math.round(v * 100)}`}
      />
    </div>
  );
});

const PolygonControls = memo(() => {
  const isPolygonObject = useCanvasStore((s) => isPolygon(s.objects));

  if (!isPolygonObject) return null;

  return (
    <>
      <PolygonSideControl />
      <PolygonStarToggle />
      <PolygonInsetControl />
    </>
  );
});

/* ----------------------------- Main Component ----------------------------- */
const ShapeSettings = memo(() => {
  const isShapeObject = useCanvasStore((s) => isShape(s.objects));

  if (!isShapeObject) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Shape Properties</Label>
      <ColorControls />
      <StrokeWidthControl />
      <PolygonControls />
    </div>
  );
});

export { ShapeSettings };
