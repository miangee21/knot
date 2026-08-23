//src/features/items/hooks/useDeleteItem.ts
"use client";

import { useMutation, useAction, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useDeleteItem() {
  const removeItem = useMutation(api.items.remove);
  const deleteImage = useAction(api.cloudinary.deleteImage);
  const convex = useConvex();

  const handleDelete = async (id: Id<"items">) => {
    // 1. Direct get all Cloudinary Public IDs (no URL regex hack needed!)
    const publicIds = await convex.query(api.items.getPostersForDeletion, {
      id,
    });

    // 2. Directly wipe them from Cloudinary BEFORE deleting from DB
    for (const publicId of publicIds) {
      await deleteImage({ publicId });
    }

    // 3. Clear DB
    await removeItem({ id });
  };

  return { handleDelete };
}
