//src/features/items/hooks/useUpdateItem.ts
"use client";

import { useMutation, useAction, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useUpdateItem() {
  const updateItem = useMutation(api.items.update);
  const deleteImage = useAction(api.cloudinary.deleteImage);
  const convex = useConvex();

  const handleUpdate = async (id: Id<"items">, data: any) => {
    // 1. Fetch old item to check if poster has changed
    const existing = await convex.query(api.items.getById, { id });

    if (existing?.posterPublicId && existing.poster !== data.poster) {
      await deleteImage({ publicId: existing.posterPublicId }); // No catch, if it fails, it halts to avoid orphans!
    }

    // 2. Safely update Convex DB
    await updateItem({ id, ...data });
  };

  return { handleUpdate };
}
