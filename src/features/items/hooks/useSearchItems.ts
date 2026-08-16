//src/features/items/hooks/useSearchItems.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useSearchItems(searchTerm: string) {
  // Pass "skip" to avoid unnecessary backend calls when search is empty
  const results = useQuery(
    api.items.search,
    searchTerm.trim() ? { query: searchTerm } : "skip",
  );

  return {
    results,
    isLoading: searchTerm.trim() !== "" && results === undefined,
  };
}
