"use client";

import { useRef } from "react";
import { MobileNotice } from "./components/indicators/mobile-notice";
import {
  Background,
  Canvas,
  Properties,
  Toolbar,
  Zoom,
} from "./components/layout";
import { DragConstraintsProvider } from "./lib/context/drag-context";

const EditorPage = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-secondary h-screen w-full">
      <Background />
      <MobileNotice />

      <div className="relative hidden size-full overflow-hidden sm:block">
        <Canvas />
        <div
          ref={constraintsRef}
          className="pointer-events-none fixed inset-0"
        />
        <DragConstraintsProvider value={constraintsRef}>
          <Toolbar />
          <Zoom />
          <Properties />
        </DragConstraintsProvider>
      </div>
    </div>
  );
};

export { EditorPage };
