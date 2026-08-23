//src/features/items/types.ts
import * as z from "zod";

export const itemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().optional().nullable(),
  start: z.number().optional().nullable(),
  end: z.number().optional().nullable(),
  sizeBytes: z.number().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  locationIds: z.array(z.string()),
  isFolder: z.boolean(),
  poster: z
    .any()
    .refine(
      (file) =>
        !file ||
        !(typeof window !== "undefined" && file instanceof File) ||
        file.size <= 5 * 1024 * 1024,
      "Image size must be less than 5MB",
    )
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;
