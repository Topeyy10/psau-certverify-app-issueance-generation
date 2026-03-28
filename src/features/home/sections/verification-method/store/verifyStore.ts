import { create } from "zustand";
import type { VerifyState } from "../types/verification.types";

export const useVerifyStore = create<VerifyState>((set) => ({
  results: null,
  processing: false,
  displayResults: false,

  setProcessing: (processing) => set({ processing }),
  setResults: (results) => set({ results, displayResults: true }),
  setDisplayResults: (displayResults) => set({ displayResults }),
  clearResults: () => set({ results: null }),
  hideDialog: () => set({ displayResults: false }),
}));
