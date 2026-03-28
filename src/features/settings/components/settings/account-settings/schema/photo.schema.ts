import z from "zod";

export const profilePhotoSchema = z.object({
  file: z
    .instanceof(File, { error: "Please upload a valid file" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Only JPEG, and PNG images are supported",
    )
    .refine((file) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const ok = img.width >= 100 && img.height >= 100;
          URL.revokeObjectURL(url);
          resolve(ok);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };
        img.src = url;
      });
    }, "Image must be at least 100x100 pixels"),
});

export type ProfilePhoto = z.infer<typeof profilePhotoSchema>;
