//src/features/items/hooks/useItemChildren.ts
"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useItemChildren(
  parentId: Id<"items"> | null,
  itemsPerPage: number | "all" = 10,
) {
  // If "all", we set a very high initial limit to fetch effectively all active records safely
  const initialNumItems = itemsPerPage === "all" ? 10000 : itemsPerPage;
  const { results, status, loadMore } = usePaginatedQuery(
    api.items.getChildren,
    { parentId },
    { initialNumItems },
  );

  return {
    children: results,
    isLoading: status === "LoadingFirstPage",
    status,
    loadMore,
  };
}
