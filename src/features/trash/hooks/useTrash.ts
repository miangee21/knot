//src/features/trash/hooks/useTrash.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

export function useTrash() {
  const trashData = useQuery(api.trash.getTrashItems);
  const restoreItem = useMutation(api.trash.restore);
  const hardDeleteItem = useMutation(api.trash.hardDelete);
  const emptyBin = useMutation(api.trash.emptyBin);

  const isLoading = trashData === undefined;

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
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  };
}
