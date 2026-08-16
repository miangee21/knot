//src/features/items/hooks/useItem.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useItem(itemId?: Id<"items">) {
  const item = useQuery(api.items.getById, itemId ? { id: itemId } : "skip");

  return {
    item,
    isLoading: itemId !== undefined && item === undefined,
  };
}
