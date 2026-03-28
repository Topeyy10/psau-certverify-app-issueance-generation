import z from "zod";

export const displayPreferencesSchema = z.object({
  theme: z.string().nonempty({ error: "Theme is required" }),
  fontFamily: z.string().nonempty({ error: "Font family is required" }),
});

export type DisplayPreferences = z.infer<typeof displayPreferencesSchema>;
