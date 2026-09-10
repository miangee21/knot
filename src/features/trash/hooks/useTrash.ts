//src/features/trash/hooks/useTrash.ts
"use client";

import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

export function useTrash(
  activeTab: "item" | "category" | "location",
  itemsPerPage: number = 10,
  searchTerm: string = "",
) {
  const storageKey = `knot_pagination_trash_${activeTab}`;
  const savedLimit =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem(storageKey))
      : 0;
  const initialNumItems = savedLimit > itemsPerPage ? savedLimit : itemsPerPage;

  const {
    results: paginatedItems,
    status,
    loadMore: convexLoadMore,
  } = usePaginatedQuery(
    api.trash.getTrashPaginated,
    { tab: activeTab, searchTerm },
    { initialNumItems },
  );

  const loadMore = (count: number) => {
    convexLoadMore(count);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        storageKey,
        String((paginatedItems?.length || 0) + count),
      );
    }
  };

  const counts = useQuery(api.trash.getTrashCounts);
  const restoreItem = useMutation(api.trash.restore);
  const hardDeleteItem = useMutation(api.trash.hardDelete);
  const emptyBin = useMutation(api.trash.emptyBin);

  const isLoading = status === "LoadingFirstPage" || counts === undefined;

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
    currentItems: paginatedItems || [],
    counts,
    isLoading,
    status,
    loadMore,
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  };
}
