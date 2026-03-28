import { InfoIcon } from "lucide-react";
import { memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvasStore } from "@/features/editor/lib/stores/canvas-store";
import {
  isCustomPlaceholder,
  type Placeholder,
} from "@/features/editor/lib/types";
import { PropertyInput } from "./shared";

const NameInput = memo(() => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor="placeholderNameInput">Placeholder Name</Label>
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-40">
            A unique placeholder name helps to simplify the data mapping process
            later on
          </TooltipContent>
        </Tooltip>
      </div>
      <PropertyInput
        type="text"
        id="placeholderNameInput"
        name="placeholderName"
        placeholder="Placeholder Name"
        selector={(s) => (s.objects as Placeholder).placeholderName ?? "Custom"}
      />
    </div>
  );
});

const PlaceholderText = memo(() => {
  return (
    <div className="space-y-1">
      <Label htmlFor="placeholderTextInput">Placeholder Text</Label>
      <PropertyInput
        type="text"
        id="placeholderTextInput"
        name="text"
        placeholder="Placeholder Text"
        selector={(s) => {
          const obj = s.objects as Placeholder;
          return "text" in obj ? obj.text : "{{custom}}";
        }}
        parser={(v) => {
          if (v.startsWith("{{") && v.endsWith("}}")) {
            return v;
          } else {
            return `{{${v}}}`;
          }
        }}
      />
    </div>
  );
});

const PlaceholderSettings = () => {
  const isPlaceholderObject = useCanvasStore((s) =>
    isCustomPlaceholder(s.objects),
  );

  if (!isPlaceholderObject) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-3">
      <Label>Placeholder</Label>
      <NameInput />
      <PlaceholderText />
    </div>
  );
};

export { PlaceholderSettings };
