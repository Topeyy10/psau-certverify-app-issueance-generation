"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCanvasStore } from "@/features/editor/lib/stores";
import { isImage } from "@/features/editor/lib/types";
import {
  makeFilterHandler,
  makeFilterSelector,
  useResetImage,
} from "@/features/editor/lib/utils";
import { PropertySlider } from "./shared";

/* ------------------------------ Brightness Slider ------------------------------ */
const BrightnessControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="brightnessInput">Brightness</Label>
    <PropertySlider
      id="brightnessInput"
      selector={makeFilterSelector("Brightness", "brightness")}
      customHandler={makeFilterHandler("Brightness", "brightness")}
      min={-100}
      max={100}
      step={1}
      formatter={(v) => `${v}%`}
    />
  </div>
));

/* ------------------------------- Contrast Control ------------------------------ */
const ContrastControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="contrastInput">Contrast</Label>
    <PropertySlider
      id="contrastInput"
      selector={makeFilterSelector("Contrast", "contrast")}
      customHandler={makeFilterHandler("Contrast", "contrast")}
      min={-100}
      max={100}
      step={1}
      formatter={(v) => `${v}%`}
    />
  </div>
));

/* ------------------------------- Saturation Control ------------------------------ */
const SaturationControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="contrastInput">Saturation</Label>
    <PropertySlider
      id="contrastInput"
      selector={makeFilterSelector("Saturation", "saturation")}
      customHandler={makeFilterHandler("Saturation", "saturation")}
      min={-100}
      max={100}
      step={1}
      formatter={(v) => `${v}`}
    />
  </div>
));

/* ------------------------------- Vibrance Control ------------------------------ */
const VibranceControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="contrastInput">Vibrance</Label>
    <PropertySlider
      id="contrastInput"
      selector={makeFilterSelector("Vibrance", "vibrance")}
      customHandler={makeFilterHandler("Vibrance", "vibrance")}
      min={-100}
      max={100}
      step={1}
      formatter={(v) => `${v}`}
    />
  </div>
));

/* ------------------------------- Hue Control ------------------------------ */
const HueControl = memo(() => (
  <div className="space-y-2">
    <Label htmlFor="contrastInput">Hue</Label>
    <PropertySlider
      id="contrastInput"
      selector={makeFilterSelector("HueRotation", "rotation")}
      customHandler={makeFilterHandler("HueRotation", "rotation")}
      min={-200}
      max={200}
      step={2}
      formatter={(v) => `${v}°`}
    />
  </div>
));

/* ----------------------------- Image Settings Panel ---------------------------- */
export const ImageSettings = () => {
  const isImageObject = useCanvasStore((s) => isImage(s.objects));
  const reset = useResetImage();

  if (!isImageObject) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label className="font-semibold">Image Properties</Label>
      <BrightnessControl />
      <ContrastControl />
      <SaturationControl />
      <VibranceControl />
      <HueControl />
      <Button variant="outline" size="sm" onClick={reset}>
        Reset Image
      </Button>
    </div>
  );
};
