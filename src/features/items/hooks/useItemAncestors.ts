//src/features/items/hooks/useItemAncestors.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useItemAncestors(itemId?: Id<"items">) {
  const ancestors = useQuery(
    api.items.getAncestors,
    itemId ? { itemId } : "skip",
  );

  return {
    ancestors,
    isLoading: itemId !== undefined && ancestors === undefined,
  };
}
