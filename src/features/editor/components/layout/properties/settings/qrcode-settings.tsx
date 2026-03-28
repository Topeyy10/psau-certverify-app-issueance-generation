import { memo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { useCanvasStore } from "@/features/editor/lib/stores";
import { isQR } from "@/features/editor/lib/types";
import { type QRCode, useUpdateProperty } from "@/features/editor/lib/utils";
import { debounce } from "@/lib/utils";
import { ColorInput } from "../../../controls/color-input";
import { PropertySlider } from "./shared";

const ColorControls = memo(() => {
  const fillColor = useCanvasStore((s) => s.objects?.fill ?? "#000000");
  const strokeColor = useCanvasStore(
    (s) => s.objects?.backgroundColor ?? "#ffffff",
  );
  const updateFill = debounce(useUpdateProperty("fill"), 300);
  const updateBackground = debounce(useUpdateProperty("backgroundColor"), 300);

  const handleFillChange = useCallback(
    (value: string) => updateFill(value),
    [updateFill],
  );
  const handleBackgroundChange = useCallback(
    (value: string) => updateBackground(value),
    [updateBackground],
  );

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="fillInput">Fill Color</Label>
        <ColorInput
          id="fillInput"
          value={fillColor as string}
          onChange={handleFillChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="backgroundInput">Background Color</Label>
        <ColorInput
          id="backgroundInput"
          value={strokeColor as string}
          onChange={handleBackgroundChange}
        />
      </div>
    </>
  );
});

const PaddingControl = memo(() => {
  return (
    <div className="space-y-2">
      <Label htmlFor="marginInput">Padding</Label>
      <PropertySlider
        id="marginInput"
        property="margin"
        selector={(s) => (s.objects as QRCode)?.margin ?? 1}
        min={0}
        max={5}
        step={1}
        formatter={(value) => String(value)}
      />
    </div>
  );
});

const QRCodeSettings = () => {
  const isQRCode = useCanvasStore((s) => isQR(s.objects));
  if (!isQRCode) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>QR Code</Label>
      <ColorControls />
      <PaddingControl />
    </div>
  );
};

export { QRCodeSettings };
