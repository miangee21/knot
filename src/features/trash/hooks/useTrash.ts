//src/features/trash/hooks/useTrash.ts
"use client";

import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

export function useTrash(
  itemsPerPage: number | "all" = 10,
  searchTerm: string = "",
) {
  const initialNumItems = itemsPerPage === "all" ? 10000 : itemsPerPage;

  const {
    results: paginatedItems,
    status,
    loadMore,
  } = usePaginatedQuery(api.trash.getTrashItems, {}, { initialNumItems });

  const searchResults = useQuery(
    api.trash.searchTrash,
    searchTerm ? { query: searchTerm } : "skip",
  );

  const assets = useQuery(api.trash.getTrashAssets);

  // If user is searching, use the global search results; otherwise use paginated items
  const itemsToUse =
    searchTerm && searchResults !== undefined
      ? searchResults
      : paginatedItems || [];

  const trashData =
    (paginatedItems !== undefined || searchResults !== undefined) && assets
      ? {
          items: itemsToUse,
          categories: assets.categories,
          locations: assets.locations,
        }
      : undefined;

  const restoreItem = useMutation(api.trash.restore);
  const hardDeleteItem = useMutation(api.trash.hardDelete);
  const emptyBin = useMutation(api.trash.emptyBin);

  const isSearchLoading = searchTerm !== "" && searchResults === undefined;
  const isLoading =
    status === "LoadingFirstPage" || assets === undefined || isSearchLoading;

  const handleRestore = async (
    id: string,
    type: "item" | "category" | "location",
  ) => {
    try {
      await restoreItem({ id, type });
      toast.success("Restored successfully!");
    } catch (error) {
      toast.error("Failed to restore.");
      throw error;
    }
  };

  const handleHardDelete = async (
    id: string,
    type: "item" | "category" | "location",
  ) => {
    try {
      await hardDeleteItem({ id, type });
      toast.success("Permanently deleted.");
    } catch (error) {
      toast.error("Failed to delete permanently.");
      throw error;
    }
  };

  const handleEmptyBin = async () => {
    try {
      await emptyBin();
      toast.success("Recycle Bin emptied successfully!");
    } catch (error) {
      toast.error("Failed to empty Recycle Bin.");
      throw error;
    }
  };

  return {
    trashData,
    isLoading,
    status,
    loadMore,
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  };
}
