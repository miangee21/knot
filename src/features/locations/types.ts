//src/features/locations/types.ts
import { z } from "zod";

export const locationSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Name is too long"),
  kind: z.enum(["hard", "os", "cloud", "mobile"]),
  icon: z.string(),

  // Storage sizes in bytes
  totalBytes: z.number().nonnegative().optional(),
  usedBytes: z.number().nonnegative().optional(),

  notes: z.string().max(500, "Notes are too long").optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
