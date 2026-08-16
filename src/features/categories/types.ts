//src/features/categories/types.ts
import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(40, "Name is too long"),
  icon: z.string().min(1, "Please select an icon"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
