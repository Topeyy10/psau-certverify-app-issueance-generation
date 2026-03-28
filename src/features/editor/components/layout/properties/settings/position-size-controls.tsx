"use client";

import { memo } from "react";
import { Label } from "@/components/ui/label";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import { isLine } from "@/features/editor/lib/types";
import { toArtboardCoord, toCanvasCoord } from "@/features/editor/lib/utils";
import { PropertyInput, PropertySlider } from "./shared";

/* ---------------------------- Specialized Components --------------------------- */
const PositionInputs = memo(() => (
  <div className="flex items-center gap-4">
    <div className="space-y-1">
      <Label htmlFor="leftInput">Left</Label>
      <PropertyInput
        id="leftInput"
        name="left"
        placeholder="X Position"
        selector={(s) =>
          toArtboardCoord("left", Math.round(s.objects?.left ?? 0))
        }
        transformer={(value) => toCanvasCoord("left", value)}
      />
    </div>
    <div className="space-y-1">
      <Label htmlFor="topInput">Top</Label>
      <PropertyInput
        id="topInput"
        name="top"
        placeholder="Y Position"
        selector={(s) =>
          toArtboardCoord("top", Math.round(s.objects?.top ?? 0))
        }
        transformer={(value) => toCanvasCoord("top", value)}
      />
    </div>
  </div>
));

const ScaleInputs = memo(() => {
  const isLineObject = useCanvasStore((s) => isLine(s.objects));

  return (
    <div className="flex items-center gap-4">
      <div className="space-y-1">
        <Label htmlFor="scaleXInput">Scale X</Label>
        <PropertyInput
          id="scaleXInput"
          name="scaleX"
          placeholder="Scale X"
          selector={(s) => s.objects?.scaleX ?? 1}
          parser={(value) => parseFloat(String(value))}
        />
      </div>
      {!isLineObject && (
        <div className="space-y-1">
          <Label htmlFor="scaleYInput">Scale Y</Label>
          <PropertyInput
            id="scaleYInput"
            name="scaleY"
            placeholder="Scale Y"
            selector={(s) => s.objects?.scaleY ?? 1}
            parser={(value) => parseFloat(String(value))}
          />
        </div>
      )}
    </div>
  );
});

const RotationControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="rotationInput">Rotation</Label>
    <PropertySlider
      id="rotationInput"
      property="angle"
      selector={(s) => Math.round(s.objects?.angle ?? 0)}
      min={0}
      max={359}
      step={1}
      formatter={(value) => `${value}°`}
      transformer={(value) => Math.round(value)}
    />
  </div>
));

const OpacityControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="opacityInput">Opacity</Label>
    <PropertySlider
      id="opacityInput"
      property="opacity"
      selector={(s) => s.objects?.opacity ?? 1}
      min={0}
      max={1}
      step={0.01}
      formatter={(value) => `${Math.round(value * 100)}%`}
      transformer={(value) => Math.round(value * 100) / 100}
    />
  </div>
));

/* ------------------------------- Main Component ------------------------------- */
const PositionSizeControls = memo(() => (
  <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
    <Label>Position & Transform</Label>
    <PositionInputs />
    <ScaleInputs />
    <RotationControl />
    <OpacityControl />
  </div>
));

PositionSizeControls.displayName = "PositionSizeControls";

export { PositionSizeControls };
