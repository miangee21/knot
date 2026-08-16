//src/features/items/hooks/useDeleteItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useDeleteItem() {
  const removeItem = useMutation(api.items.remove);

  // UI confirmation (cascade delete alert) will happen before calling this
  const handleDelete = async (id: Id<"items">) => {
    try {
      await removeItem({ id });
    } catch (error) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  };

  return { handleDelete };
}
