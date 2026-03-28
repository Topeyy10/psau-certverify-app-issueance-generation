"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface InputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "type"> {
  onValueChange?: (value: string | number) => void;
  allowNegative?: boolean;
  type?: "number" | "text";
}

const CustomInput = memo<InputProps>((props) => {
  const {
    value,
    onValueChange,
    allowNegative = true,
    type = "number",
    ...rest
  } = props;
  const [displayValue, setDisplayValue] = useState(value ?? "");
  const [dirty, setDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value only if not editing
  useEffect(() => {
    if (!dirty) setDisplayValue(value ?? "");
  }, [value, dirty]);

  const commit = useCallback(
    (v: string) => {
      if (!dirty) return; // <- only commit if user typed

      if (type === "text") {
        setDisplayValue(v);
        onValueChange?.(v);
      } else {
        let num = parseFloat(v);
        if (Number.isNaN(num)) {
          setDisplayValue(value ?? "");
        } else {
          if (!allowNegative && num < 0) num = 0;
          setDisplayValue(num);
          onValueChange?.(num);
        }
      }
      setDirty(false);
    },
    [dirty, value, allowNegative, onValueChange, type],
  );

  return (
    <Input
      ref={inputRef}
      value={displayValue}
      onFocus={() => setDirty(false)}
      onChange={(e) => {
        setDisplayValue(e.target.value);
        setDirty(true);
      }}
      onBlur={() => commit(String(displayValue))}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(String(displayValue));
          inputRef.current?.blur();
        }
        if (e.key === "Escape") {
          setDisplayValue(value ?? "");
          setDirty(false);
          inputRef.current?.blur();
        }
      }}
      {...rest}
    />
  );
});

export { CustomInput as Input };
