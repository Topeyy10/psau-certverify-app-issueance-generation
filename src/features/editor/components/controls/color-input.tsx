"use client";

import { memo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface ColorInputProps {
  value?: string | null;
  onChange?: (color: string) => void;
  id?: string;
  defaultValue?: string;
}

const fallbackColor = "#FFFFFF";

const ColorInput = memo<ColorInputProps>((props) => {
  const { id, value, onChange, defaultValue = fallbackColor } = props;

  // Normalize incoming value with fallback
  const normalizedValue = (value || defaultValue || fallbackColor)
    .replace(/^#/, "")
    .toUpperCase();

  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState(normalizedValue);
  const [dirty, setDirty] = useState(false);

  const normalizeHex = (input: string): string => {
    const validHex = input.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    if (!validHex) return "#FFFFFF";

    let hex: string;
    if (validHex.length <= 2) {
      hex = validHex.padEnd(2, validHex[0] || "F").repeat(3);
    } else if (validHex.length <= 5) {
      hex = (validHex + "0".repeat(3)).slice(0, 3).replace(/(.)/g, "$1$1");
    } else {
      hex = validHex.slice(0, 6);
    }

    return `#${hex}`;
  };

  // Handle manual text input changes
  const handleManualChange = (v: string) => {
    setDisplayValue(v.toUpperCase());
    setDirty(true);
  };

  // Commit the value to the parent and update display
  const commitValue = () => {
    if (!dirty) return;
    const hex = normalizeHex(displayValue);
    setDisplayValue(hex.replace("#", ""));
    onChange?.(hex);
    setDirty(false);
  };

  // Handle color picker changes
  const handleColorPickerChange = (color: string) => {
    const hex = normalizeHex(color);
    setDisplayValue(hex.replace("#", ""));
    onChange?.(hex);
    setDirty(false);
  };

  // Keep displayValue in sync with external value when not editing
  if (!dirty && displayValue !== normalizedValue) {
    setDisplayValue(normalizedValue);
  }

  return (
    <div className="relative">
      <input
        type="color"
        value={`#${displayValue || normalizedValue}`}
        onChange={(e) => handleColorPickerChange(e.target.value)}
        className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 rounded border"
      />
      <Input
        id={id}
        ref={inputRef}
        type="text"
        className="pl-10"
        placeholder="FFFFFF"
        value={displayValue}
        maxLength={6}
        onChange={(e) => handleManualChange(e.target.value)}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitValue();
          if (e.key === "Escape") {
            setDisplayValue(normalizedValue);
            setDirty(false);
          }
        }}
      />
    </div>
  );
});

export { ColorInput };
