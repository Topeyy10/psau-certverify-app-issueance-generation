"use client";

import { GripHorizontalIcon } from "lucide-react";
import { type HTMLMotionProps, motion, useDragControls } from "motion/react";
import type React from "react";
import { memo } from "react";
import { useSettingsStore } from "@/features/settings";
import { cn } from "@/lib/utils";
import { useDragConstraints } from "../../lib/context/drag-context";
import { useCanvasStore } from "../../lib/stores";

const Panel = memo<HTMLMotionProps<"div">>((props) => {
  const { children, className, ...rest } = props;
  const canDrag = useSettingsStore((s) => s.preferences.enableDragToMove);
  const interactive = useCanvasStore((s) => s.interactive);

  const dragControls = useDragControls();
  const constraintsRef = useDragConstraints();

  const handlePointerDown = (e: React.PointerEvent) => {
    if (canDrag) {
      dragControls.start(e);
    }
  };

  return (
    <motion.div
      drag={canDrag}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={constraintsRef}
      dragElastic={0.2}
      dragMomentum={false}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      whileDrag={{
        boxShadow:
          "0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1))",
        scale: 1.02,
        zIndex: 2,
        userSelect: "none",
      }}
      className={cn(
        "bg-background pointer-events-auto absolute flex min-w-60 flex-col items-stretch rounded-lg border",
        !interactive && "pointer-events-none",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "drag-handle text-muted-foreground flex items-center justify-center rounded-t-lg cursor-pointer",
          canDrag
            ? "bg-secondary/30 cursor-grab active:cursor-grabbing"
            : "bg-secondary/10 cursor-default",
        )}
        onPointerDown={handlePointerDown}
      >
        {canDrag && <GripHorizontalIcon className="size-3" />}
      </div>
      <div className="flex w-full items-center justify-center gap-2 p-2 pt-1">
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
});

export { Panel };
