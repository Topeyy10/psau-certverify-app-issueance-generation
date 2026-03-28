"use client";

import { create } from "zustand";
import type { CanvasState } from "../types";

export const useCanvasStore = create<CanvasState>((set, get) => ({
  interactive: false,
  canvas: null,
  artboard: null,
  objects: null,
  artboardPreview: null,
  saveStatus: "unsaved",

  setInteractive: (interactive) => set({ interactive }),
  setCanvas: (canvas) => set({ canvas }),
  setArtboard: (artboard) => set({ artboard }),
  setObjects: (objects) => set({ objects }),
  setArtboardPreview: (artboardPreview) => set({ artboardPreview }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
}));
