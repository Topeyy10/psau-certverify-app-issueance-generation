import { memo, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import type { CanvasState } from "@/features/editor/lib/types";
import { useUpdateProperty } from "@/features/editor/lib/utils";

interface PropertySliderProps {
  id: string;
  property?: string;
  customHandler?: (value: number, currentState: any) => Record<string, any>;
  selector: (state: CanvasState) => number;
  min: number;
  max: number;
  step: number;
  formatter: (value: number) => string;
  transformer?: (value: number) => number;
}

const PropertySlider = memo<PropertySliderProps>((props) => {
  const {
    id,
    property,
    customHandler,
    selector,
    min,
    max,
    step,
    formatter,
    transformer,
  } = props;

  const value = useCanvasStore(selector);
  const currentState = useCanvasStore((s) => s.objects);
  const update = useUpdateProperty(property);

  const handleChange = useCallback(
    (values: number[]) => {
      const processedValue = transformer ? transformer(values[0]) : values[0];

      if (customHandler) {
        // Custom handler with access to current state
        const updateObject = customHandler(processedValue, currentState);
        update(updateObject);
      } else if (property) {
        // Single property update
        update(processedValue);
      }
    },
    [update, transformer, property, customHandler, currentState],
  );

  return (
    <>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
      />
      <span className="text-muted-foreground text-sm tabular-nums">
        {formatter(value)}
      </span>
    </>
  );
});

export { PropertySlider };
