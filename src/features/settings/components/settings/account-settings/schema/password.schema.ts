import z from "zod";
import { PASSWORD_RULES } from "@/constants";

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .nonempty({ error: "Current password is required" })
      .min(PASSWORD_RULES.length.min, { error: PASSWORD_RULES.length.message }),
    newPassword: z
      .string()
      .nonempty({ error: "Password is required" })
      .min(PASSWORD_RULES.length.min, {
        error: PASSWORD_RULES.length.message,
      })
      .refine((val) => PASSWORD_RULES.lowercase.regex.test(val), {
        error: PASSWORD_RULES.lowercase.message,
      })
      .refine((val) => PASSWORD_RULES.uppercase.regex.test(val), {
        error: PASSWORD_RULES.uppercase.message,
      })
      .refine((val) => PASSWORD_RULES.number.regex.test(val), {
        error: PASSWORD_RULES.number.message,
      })
      .refine((val) => PASSWORD_RULES.special.regex.test(val), {
        error: PASSWORD_RULES.special.message,
      }),
    confirmPassword: z.string().nonempty({ error: "Password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PasswordSettings = z.infer<typeof passwordSchema>;
