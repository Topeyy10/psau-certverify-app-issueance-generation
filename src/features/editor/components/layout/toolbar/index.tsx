import { ImageIcon, TypeIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTools } from "../../../lib/hooks/use-tools";
import { ToolButton } from "../../controls/tool-button";
import { SaveStatusBadge } from "../../indicators/save-badge";
import { Panel } from "../../panels/editor-panel";
import { PlaceholderDropdown } from "./dropdown-placeholders";
import { FileDropdown } from "./file-dropdown";
import { ObjectActions } from "./object-actions";
import { ShapeButtons } from "./shape-buttons";

const Toolbar = () => {
  const {
    handleAddText,
    handleAddShape,
    handleAddPlaceholder,
    handleAddImage,
    imageFileRef,
  } = useTools();

  return (
    <Panel className="top-2 left-1/2 min-w-0 -translate-x-1/2">
      <FileDropdown />
      <Separator orientation="vertical" className="!h-8" />
      <ToolButton
        title="Add Text"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={handleAddText}
      >
        <TypeIcon className="size-4" />
      </ToolButton>
      <Separator orientation="vertical" className="!h-8" />
      <ToolButton
        title="Add Image"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={handleAddImage}
      >
        <ImageIcon className="size-4" />
      </ToolButton>
      <Separator orientation="vertical" className="!h-8" />

      <ShapeButtons onAddShape={handleAddShape} />
      <Separator orientation="vertical" className="!h-8" />
      <PlaceholderDropdown onClick={handleAddPlaceholder} />
      <Separator orientation="vertical" className="!h-8" />
      <ObjectActions />
      <Separator orientation="vertical" className="!h-8" />
      <SaveStatusBadge />

      {/* Hidden Input */}
      <input
        ref={imageFileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="sr-only"
      />
    </Panel>
  );
};

export { Toolbar };
