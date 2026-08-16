//src/features/items/hooks/useItemChildren.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useItemChildren(parentId: Id<"items"> | null) {
  // If parentId is null, it typically fetches the root-level items
  const children = useQuery(api.items.getChildren, { parentId });

  return {
    children,
    isLoading: children === undefined,
  };
}
