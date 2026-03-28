import { type JSX, memo, useCallback } from "react";
import { Input } from "@/features/editor/components/controls/custom-input";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import { useUpdateProperty } from "@/features/editor/lib/utils";

interface PropertyInputProps<T = number> {
  id: string;
  name: string;
  placeholder: string;
  selector: (state: any) => T;
  transformer?: (value: T) => T;
  parser?: (value: T) => T;
  type?: "number" | "text";
}

const PropertyInput = memo(<T = number>(props: PropertyInputProps<T>) => {
  const {
    id,
    name,
    placeholder,
    selector,
    transformer,
    parser,
    type = "number",
  } = props;
  const value = useCanvasStore(selector);
  const update = useUpdateProperty(name as any);

  const handleChange = useCallback(
    (inputValue: T) => {
      const processedValue = parser ? parser(inputValue) : inputValue;
      const finalValue = transformer
        ? transformer(processedValue)
        : processedValue;
      update(finalValue);
    },
    [update, transformer, parser],
  );

  return (
    <Input
      id={id}
      name={name}
      value={value as string | number}
      onValueChange={handleChange as (value: string | number) => void}
      placeholder={placeholder}
      type={type}
    />
  );
}) as <T extends string | number = number>(
  props: PropertyInputProps<T>,
) => JSX.Element;

export { PropertyInput };
