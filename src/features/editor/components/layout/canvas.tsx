import { useCanvas } from "../../lib/hooks/use-canvas";

const Canvas = () => {
  const { canvasContainerRef, canvasRef } = useCanvas();

  return (
    <div ref={canvasContainerRef} className="size-full">
      <canvas ref={canvasRef} />
    </div>
  );
};

export { Canvas };
