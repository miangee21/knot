//src/features/items/hooks/useCreateItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useCreateItem() {
  const createItem = useMutation(api.items.create);

  const handleCreate = async (data: any) => {
    try {
      const newItemId = await createItem(data);
      return newItemId;
    } catch (error) {
      console.error("Failed to create item:", error);
      throw error;
    }
  };

  return { handleCreate };
}
