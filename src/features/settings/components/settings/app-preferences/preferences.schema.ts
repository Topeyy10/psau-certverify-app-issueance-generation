import z from "zod";

export const appPreferencesSchema = z.object({
  autoSave: z.boolean({ error: "Auto-save must be a boolean value" }),
  checkerboardBackground: z.boolean({
    error: "Checkerboard background must be true or false",
  }),
  autoClipToArtboard: z.boolean({
    error: "Auto-clip to artboard must be true or false",
  }),
  enableDragToMove: z.boolean({
    error: "Enable drag-to-move must be true or false",
  }),
});

export type AppPreferences = z.infer<typeof appPreferencesSchema>;
