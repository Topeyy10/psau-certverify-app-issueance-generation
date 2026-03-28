import z from "zod";

export const loginSchema = z.object({
  email: z
    .email({ error: "Invalid email address" })
    .nonempty({ error: "Email is required" }),
  password: z.string().nonempty({ error: "Password is required" }),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
