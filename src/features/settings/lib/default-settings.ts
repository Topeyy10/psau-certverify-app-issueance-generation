import type { Settings } from "./types";

export const DefaultSettingsValue: Settings = {
  preferences: {
    theme: "light",
    fontFamily: "Roboto",
    autoSave: true,
    checkerboardBackground: true,
    autoClipToArtboard: false,
    enableDragToMove: true,
  },
  security: {
    sessions: [],
  },
};
