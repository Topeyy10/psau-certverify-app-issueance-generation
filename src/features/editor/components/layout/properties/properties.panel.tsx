import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvasStore } from "../../../lib/stores/canvas-store";
import { Panel } from "../../panels/editor-panel";
import { ObjectProperties } from "./object.properties";
import { PageProperties } from "./page.properties";

const Properties = () => {
  return (
    <Panel className="top-1/2 right-2 max-w-60 min-w-60 -translate-y-1/2">
      <ScrollArea className="block h-115 w-full space-y-4 p-2">
        <Settings />
      </ScrollArea>
    </Panel>
  );
};

const Settings = () => {
  const hasActiveObject = useCanvasStore((s) => !!s.objects);
  return hasActiveObject ? <ObjectProperties /> : <PageProperties />;
};

export { Properties };
