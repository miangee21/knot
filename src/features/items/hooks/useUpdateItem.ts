//src/features/items/hooks/useUpdateItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useUpdateItem() {
  const updateItem = useMutation(api.items.update);

  const handleUpdate = async (id: Id<"items">, data: any) => {
    try {
      await updateItem({ id, ...data });
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    }
  };

  return { handleUpdate };
}
