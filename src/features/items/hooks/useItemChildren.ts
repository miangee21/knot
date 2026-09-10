//src/features/items/hooks/useItemChildren.ts
"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useItemChildren(
  parentId: Id<"items"> | null,
  itemsPerPage: number = 10,
) {
  const storageKey = `knot_pagination_${parentId || "root"}`;
  const savedLimit =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem(storageKey))
      : 0;

  const initialNumItems = savedLimit > itemsPerPage ? savedLimit : itemsPerPage;

  const {
    results,
    status,
    loadMore: convexLoadMore,
  } = usePaginatedQuery(
    api.items.getChildren,
    { parentId },
    { initialNumItems },
  );

  const loadMore = (count: number) => {
    convexLoadMore(count);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        storageKey,
        String((results?.length || 0) + count),
      );
    }
  };

  return {
    children: results,
    isLoading: status === "LoadingFirstPage",
    status,
    loadMore,
  };
}
