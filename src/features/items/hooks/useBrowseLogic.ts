//src/features/items/hooks/useBrowseLogic.ts
import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ItemDoc, ItemFormData } from "@/features/items/types";
import { toast } from "sonner";
import { useCreateItem } from "@/features/items/hooks/useCreateItem";
import { useUpdateItem } from "@/features/items/hooks/useUpdateItem";
import { useDeleteItem } from "@/features/items/hooks/useDeleteItem";

// --- FILTERS & PAGINATION HOOK ---
export function useBrowseFilters(
  items: (ItemDoc | null)[] | undefined | null,
  locationFilterId: string | null,
  searchTerm: string,
  debouncedSearchTerm: string,
  itemsPerPage: number | "all",
  currentPage: number,
  paginationStatus: string,
) {
  const searchResults = useQuery(
    api.items.search,
    debouncedSearchTerm ? { query: debouncedSearchTerm } : "skip",
  );

  const allItemsFlat = useQuery(
    api.items.getAllItemsFlat,
    locationFilterId && !debouncedSearchTerm ? {} : "skip",
  );

  const isSearching =
    (debouncedSearchTerm.length > 0 && searchResults === undefined) ||
    searchTerm !== debouncedSearchTerm ||
    (!!locationFilterId && !debouncedSearchTerm && allItemsFlat === undefined);

  const filteredItems = React.useMemo(() => {
    let baseItems: ItemDoc[] = (items || []).filter(
      (i): i is ItemDoc => i !== null,
    );
    if (debouncedSearchTerm) {
      baseItems = (searchResults as ItemDoc[]) || [];
    } else if (locationFilterId) {
      baseItems = (allItemsFlat as ItemDoc[]) || [];
    }

    if (locationFilterId) {
      baseItems = baseItems.filter(
        (item) =>
          item && (item.locationIds as string[]).includes(locationFilterId),
      );
    }
    return baseItems;
  }, [
    items,
    searchResults,
    locationFilterId,
    allItemsFlat,
    debouncedSearchTerm,
  ]);

  const totalItems = filteredItems.length;
  const isAll = itemsPerPage === "all";
  const maxPage = isAll
    ? 1
    : Math.max(1, Math.ceil(totalItems / (itemsPerPage as number)));

  const hasMoreToLoad =
    (paginationStatus === "CanLoadMore" ||
      paginationStatus === "LoadingMore") &&
    !debouncedSearchTerm &&
    !locationFilterId;

  const safeCurrentPage =
    currentPage > maxPage && !hasMoreToLoad
      ? Math.max(1, maxPage)
      : currentPage;

  const startIndex = isAll
    ? 0
    : (safeCurrentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return {
    isSearching,
    totalItems,
    safeCurrentPage,
    currentItems,
  };
}

// --- MODALS & MUTATIONS HOOK ---
export function useBrowseMutations() {
  const { handleCreate } = useCreateItem();
  const { handleUpdate } = useUpdateItem();
  const { handleDelete } = useDeleteItem();
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);
  const deleteStorage = useMutation(api.items.deleteStorage);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ItemDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ItemDoc | null>(null);
  const [detailItem, setDetailItem] = React.useState<ItemDoc | null>(null);
  const [movingItem, setMovingItem] = React.useState<ItemDoc | null>(null);

  const openNewDialog = React.useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const handleItemClick = React.useCallback((item: ItemDoc) => {
    setDetailItem(item);
  }, []);

  const onFormSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    let newlyUploadedStorageId: Id<"_storage"> | undefined = undefined;

    try {
      let posterStorageId = undefined;
      if (data.poster instanceof File) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": data.poster.type },
          body: data.poster,
        });
        if (!result.ok) {
          throw new Error(`Failed to upload image. Status: ${result.status}`);
        }
        const { storageId } = await result.json();
        posterStorageId = storageId;
        newlyUploadedStorageId = storageId as Id<"_storage">;
      } else if (
        typeof data.poster === "string" &&
        editingItem?.posterStorageId
      ) {
        posterStorageId = editingItem.posterStorageId;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { poster, ...cleanData } = data;
      const payload = { ...cleanData, posterStorageId };

      try {
        if (editingItem)
          await handleUpdate(editingItem._id as Id<"items">, payload);
        else await handleCreate(payload);
      } catch (dbError) {
        if (newlyUploadedStorageId) {
          await deleteStorage({ storageId: newlyUploadedStorageId });
        }
        throw dbError;
      }

      setIsFormOpen(false);
      toast.success(editingItem ? "Item updated!" : "Item created!");
    } catch {
      toast.error("Failed to save item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await handleDelete(itemToDelete._id as Id<"items">);
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    isFormOpen,
    setIsFormOpen,
    editingItem,
    setEditingItem,
    isSubmitting,
    itemToDelete,
    setItemToDelete,
    detailItem,
    setDetailItem,
    movingItem,
    setMovingItem,
    openNewDialog,
    handleItemClick,
    onFormSubmit,
    onConfirmDelete,
  };
}
