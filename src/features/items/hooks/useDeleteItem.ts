//src/features/items/hooks/useDeleteItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useDeleteItem() {
  const moveToBin = useMutation(api.trash.moveToBin);

  const handleDelete = async (id: Id<"items">) => {
    // Instantly soft-delete the item and its children (Convex handles the rest!)
    await moveToBin({ id, type: "item" });
  };

  return { handleDelete };
}
