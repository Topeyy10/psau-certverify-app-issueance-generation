import type { Canvas } from "fabric";
import { InfoIcon } from "lucide-react";
import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { STANDARD_DPI } from "@/features/dashboard/shared/constants/paper";
import { debounce } from "@/lib/utils";
import { useCanvasStore } from "../../../lib/stores/canvas-store";
import { useTemplateStore } from "../../../lib/stores/template-store";
import { ColorInput } from "../../controls/color-input";

const PageProperties = () => {
  return (
    <div className="flex flex-col space-y-4">
      <p className="mb-3 text-lg leading-none font-medium">Page Properties</p>

      <TemplateMeta />
      <Separator />
      <div className="space-y-1">
        <Label htmlFor="colorInput">Background Color</Label>
        <BackgroundColorInput />
      </div>
      <div className="space-y-1">
        <Label htmlFor="previewArtboard">Preview</Label>
        <ArtboardPreview />
      </div>
    </div>
  );
};

const TemplateMeta = memo(() => {
  const { name, size } = useTemplateStore(
    useShallow((s) => ({ name: s.name, size: s.size })),
  );

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="templateName">Template Name</Label>
        <Input id="templateName" defaultValue={name ?? ""} disabled readOnly />
      </div>

      <div className="space-y-1">
        <Label htmlFor="templateSize">Template Size</Label>
        <div className="relative">
          <Tooltip>
            <TooltipTrigger className="absolute top-1/2 right-3 -translate-y-1/2">
              <InfoIcon className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>
                Width:{" "}
                <span>
                  {Math.round(
                    (size?.w ?? 0 / STANDARD_DPI + Number.EPSILON) * 100,
                  ) / 100}
                  "
                </span>
              </p>
              <p>
                Height:{" "}
                <span>
                  {Math.round(
                    (size?.h ?? 0 / STANDARD_DPI + Number.EPSILON) * 100,
                  ) / 100}
                  "
                </span>
              </p>
            </TooltipContent>
          </Tooltip>
          <Input
            id="templateSize"
            className="pr-8"
            defaultValue={size?.label ?? ""}
            disabled
            readOnly
          />
        </div>
      </div>
    </>
  );
});

const BackgroundColorInput = memo(() => {
  const canvas = useCanvasStore((s) => s.canvas);
  const artboard = useCanvasStore((s) => s.artboard);
  const artboardBackground = useCanvasStore((s) => s.artboard?.fill ?? null);

  const debouncedSelectionCleared = debounce((canvas: Canvas) => {
    canvas.fire("selection:cleared");
  }, 100);

  const handleBackgroundColorChange = useCallback(
    (color: string) => {
      if (!canvas || !artboard) return;

      artboard.set({ fill: color });
      canvas.renderAll();
      debouncedSelectionCleared(canvas);
    },
    [canvas, artboard, debouncedSelectionCleared],
  );

  return (
    <ColorInput
      value={artboardBackground as string}
      onChange={handleBackgroundColorChange}
    />
  );
});

const ArtboardPreview = memo(() => {
  const artboardPreview = useCanvasStore((s) => s.artboardPreview);

  return (
    <div className="aspect-video overflow-hidden rounded-sm border bg-secondary">
      <img
        className="h-full w-full object-contain shadow"
        src={artboardPreview ?? undefined}
        style={{ imageRendering: "-webkit-optimize-contrast" }}
        draggable={false}
        alt="Artboard preview"
      />
    </div>
  );
});

export { PageProperties };
