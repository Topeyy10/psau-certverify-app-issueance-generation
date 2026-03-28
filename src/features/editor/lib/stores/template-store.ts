"use client";

import { create } from "zustand";
import type { TemplateState } from "../types/canvas";

export const useTemplateStore = create<TemplateState>((set) => ({
  name: null,
  size: null,
  meta: null,
  id: null,
  jsonId: null,

  setName: (name) => set({ name }),
  setSize: (w, h, label) => set({ size: { w, h, label } }),
  setMeta: (meta) => set({ meta }),
  setId: (id) => set({ id }),
  setJsonId: (jsonId) => set({ jsonId }),
}));
