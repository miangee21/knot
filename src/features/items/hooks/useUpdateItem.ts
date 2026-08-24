//src/features/items/hooks/useUpdateItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useUpdateItem() {
  const updateItem = useMutation(api.items.update);

  const handleUpdate = async (id: Id<"items">, data: any) => {
    // Safely update Convex DB with the new data
    await updateItem({ id, ...data });
  };

  return { handleUpdate };
}
