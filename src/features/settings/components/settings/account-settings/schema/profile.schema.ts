import z from "zod";

export const profileSchema = z.object({
  fullName: z
    .string({ error: "Full name is required" })
    .nonempty({ error: "Full name is required" })
    .min(5, { error: "Name must be at least 5 characters" })
    .max(128, { error: "Name must not exceed 128 characters" }),
});

export type Profile = z.infer<typeof profileSchema>;
