import z from "zod";
import { PAPER_SIZE_LABELS } from "@/features/dashboard/shared/constants/paper";

export const templateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Template name is required" })
    .max(100, { message: "Template name must be 100 characters or less" }),
  paperSize: z.enum(PAPER_SIZE_LABELS, {
    message: "Paper size is required",
  }),
  isPortrait: z.boolean({ message: "Orientation is required" }),
});

export type TemplateFormType = z.infer<typeof templateFormSchema>;
