import z from "zod";

export const emailSchema = z.object({
  email: z
    .email({ error: "Invalid email address" })
    .nonempty({ error: "Email is required" }),
  password: z.string().nonempty({ error: "Password is required" }),
});

export type EmailSettings = z.infer<typeof emailSchema>;
