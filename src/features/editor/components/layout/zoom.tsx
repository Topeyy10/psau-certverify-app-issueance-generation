import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useZoomPan } from "../../lib/hooks/use-zoom-pan";
import { Panel } from "../panels/editor-panel";

const Zoom = () => {
  return (
    <Panel className="right-2 bottom-2 min-w-0">
      <Controls />
    </Panel>
  );
};

const Controls = () => {
  const { zoom, ...actions } = useZoomPan();

  return (
    <>
      <ZoomControls {...actions} />
      <ZoomLevel zoom={zoom} />
    </>
  );
};

const ZoomControls = memo<Omit<ReturnType<typeof useZoomPan>, "zoom">>(
  (props) => {
    const { zoomIn, zoomOut, resetZoom } = props;

    return (
      <>
        <Button variant="ghost" size="icon" className="size-8" onClick={zoomIn}>
          <ZoomInIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={zoomOut}
        >
          <ZoomOutIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={resetZoom}>
          Reset
        </Button>
      </>
    );
  },
);

const ZoomLevel = memo<{ zoom: number }>(({ zoom }) => (
  <p className="bg-secondary w-15 rounded-lg px-2 py-1 text-center tabular-nums">
    {zoom}%
  </p>
));

export { Zoom };
