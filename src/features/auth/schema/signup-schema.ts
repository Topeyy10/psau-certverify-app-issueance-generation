import z from "zod";
import { PASSWORD_RULES } from "@/constants";

export const signupSchema = z
  .object({
    fullName: z
      .string({ error: "Full name is required" })
      .nonempty({ error: "Full name is required" })
      .min(5, { error: "Name must be at least 5 characters" })
      .max(128, { error: "Name must not exceed 128 characters" }),
    email: z
      .email({ error: "Invalid email address" })
      .nonempty({ error: "Email is required" }),
    password: z
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
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
