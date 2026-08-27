// src/features/items/types.ts
import * as z from "zod";

export interface LocationDoc {
  _id: string;
  name: string;
  icon: string;
  kind: "hard" | "os" | "cloud" | "mobile";
  usedBytes?: number;
  totalBytes?: number;
  deletedAt?: number;
  notes?: string;
}

export interface CategoryDoc {
  _id: string;
  name: string;
  icon: string;
  deletedAt?: number;
  notes?: string;
}

export const itemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().optional().nullable(),
  start: z.number().optional().nullable(),
  end: z.number().optional().nullable(),
  sizeBytes: z.number().min(0, "Size is required"),
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

// ====== NAYE STRICT TYPES ====== //

export interface ItemDoc {
  _id: string;
  _creationTime?: number;
  userId: string;
  parentId: string | null;
  name: string;
  categoryId?: string;
  locationIds: string[];
  rangeStart?: number;
  rangeEnd?: number;
  sizeBytes: number;
  isFolder: boolean;
  posterStorageId?: string;
  posterUrl?: string; // Resolves on the fly from storage
  notes?: string;
  deletedAt?: number;

  // Optional fields (like Risk Analysis)
  riskPath?: string;
  effectiveLocations?: string[];
}
