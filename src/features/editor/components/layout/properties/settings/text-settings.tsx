import type { FabricText } from "fabric";
import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FONT_FAMILIES } from "@/constants";
import {
  ALIGNMENT_OPTIONS,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGNMENT,
  STYLE_OPTIONS,
} from "@/features/editor/lib/constants";
import { useCanvasStore } from "@/features/editor/lib/stores";
import { isPlaceholder, isText } from "@/features/editor/lib/types";
import { useUpdateProperty } from "@/features/editor/lib/utils";
import { ColorInput } from "../../../controls/color-input";
import { PropertySlider } from "./shared";

/* ---------------------------- Reusable Toggle Component --------------------------- */
const ToggleControl = memo<{
  id: string;
  label: string;
  value: string | string[];
  type: "single" | "multiple";
  options: Array<{ value: string; icon: React.ComponentType }>;
  onValueChange: (value: any) => void;
}>(({ id, label, value, type, options, onValueChange }) => (
  <div className="space-y-1">
    <Label htmlFor={id}>{label}</Label>
    {type === "single" ? (
      <ToggleGroup
        id={id}
        value={value as string}
        type="single"
        className="w-full"
        variant="outline"
        onValueChange={onValueChange}
      >
        {options.map(({ value: optionValue, icon: Icon }) => (
          <ToggleGroupItem key={optionValue} value={optionValue}>
            <Icon />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ) : (
      <ToggleGroup
        id={id}
        value={value as string[]}
        type="multiple"
        className="w-full"
        variant="outline"
        onValueChange={onValueChange}
      >
        {options.map(({ value: optionValue, icon: Icon }) => (
          <ToggleGroupItem key={optionValue} value={optionValue}>
            <Icon />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )}
  </div>
));

/* ---------------------------- Font Controls --------------------------- */
const FontFamily = memo(() => {
  const fontFamily = useCanvasStore(
    (s) => (s.objects as FabricText).fontFamily ?? "Arial",
  );
  const updateFont = useUpdateProperty("fontFamily");

  const handleFamilyChange = useCallback(
    (newFont: string) => {
      updateFont(newFont);
    },
    [updateFont],
  );

  return (
    <div className="space-y-1">
      <Label htmlFor="fontInput">Font Family</Label>
      <Select value={fontFamily} onValueChange={handleFamilyChange}>
        <SelectTrigger className="w-full truncate" style={{ fontFamily }}>
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

const FillColor = memo(() => {
  const fillColor = useCanvasStore(
    (s) => s.objects?.fill ?? DEFAULT_FONT_COLOR,
  );
  const updateFill = useUpdateProperty("fill");

  const handleFillChange = useCallback(
    (value: string) => updateFill(value),
    [updateFill],
  );

  return (
    <div className="space-y-1">
      <Label htmlFor="fontColorInput">Fill Color</Label>
      <ColorInput
        id="fontColorInput"
        value={fillColor as string}
        onChange={handleFillChange}
      />
    </div>
  );
});

const FontSize = memo(() => {
  return (
    <div className="space-y-2">
      <Label htmlFor="fontSizeInput">Font Size</Label>
      <PropertySlider
        id="fontSizeInput"
        property="fontSize"
        selector={(s) =>
          Math.round((s.objects as FabricText).fontSize ?? DEFAULT_FONT_SIZE)
        }
        min={8}
        max={72}
        step={1}
        formatter={(value) => `${value}px`}
        transformer={(value) => Math.round(value)}
      />
    </div>
  );
});

/* ---------------------------- Style Controls --------------------------- */
const StyleControls = memo(() => {
  const styles = useCanvasStore(
    useShallow((s) => {
      const obj = s.objects as FabricText;
      if (!obj) return [];

      const activeStyles: string[] = [];
      if (obj.fontWeight === "bold") activeStyles.push("bold");
      if (obj.underline) activeStyles.push("underline");
      if (obj.fontStyle === "italic") activeStyles.push("italic");
      if (obj.linethrough) activeStyles.push("linethrough");

      return activeStyles;
    }),
  );

  const alignment = useCanvasStore(
    (s) => (s.objects as FabricText)?.textAlign ?? DEFAULT_TEXT_ALIGNMENT,
  );

  const updateStyle = useUpdateProperty();
  const updateAlignment = useUpdateProperty("textAlign");

  const handleStyleChange = useCallback(
    (styles: string[]) => {
      updateStyle({
        fontWeight: styles.includes("bold") ? "bold" : "normal",
        underline: styles.includes("underline"),
        fontStyle: styles.includes("italic") ? "italic" : "normal",
        linethrough: styles.includes("linethrough"),
      });
    },
    [updateStyle],
  );

  const handleAlignmentChange = useCallback(
    (newAlignment: string) => updateAlignment(newAlignment),
    [updateAlignment],
  );

  return (
    <>
      <ToggleControl
        id="stylesToggle"
        label="Styles"
        value={styles}
        type="multiple"
        options={[...STYLE_OPTIONS]}
        onValueChange={handleStyleChange}
      />

      <ToggleControl
        id="alignmentToggle"
        label="Alignment"
        value={alignment}
        type="single"
        options={[...ALIGNMENT_OPTIONS]}
        onValueChange={handleAlignmentChange}
      />
    </>
  );
});

/* ------------------------------- Main Component ------------------------------- */
const TextSettings = memo(() => {
  const isTextObject = useCanvasStore((s) => isText(s.objects));
  const isQRCodePlaceholder = useCanvasStore(
    (s) => isPlaceholder(s.objects) && s.objects.variant === "qr-code",
  );

  if (!isTextObject || isQRCodePlaceholder) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Text Properties</Label>
      <FontFamily />
      <FontSize />
      <FillColor />
      <StyleControls />
    </div>
  );
});

export { TextSettings };
