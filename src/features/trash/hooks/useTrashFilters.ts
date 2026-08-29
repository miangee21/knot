//src/features/trash/hooks/useTrashFilters.ts
import * as React from "react";
import { ItemDoc, CategoryDoc, LocationDoc } from "@/features/items/types";

export type TrashType = "item" | "category" | "location";
export type TrashItemBase = {
  type: TrashType;
  name: string;
  _id: string;
  deletedAt?: number;
};
export type TrashedItem = (ItemDoc | CategoryDoc | LocationDoc) & TrashItemBase;

export const TAB_CONFIG = [
  { id: "item" as TrashType, label: "Items", key: "items" },
  { id: "category" as TrashType, label: "Categories", key: "categories" },
  { id: "location" as TrashType, label: "Locations", key: "locations" },
];

export type TrashDataPayload = {
  items: ItemDoc[];
  categories: CategoryDoc[];
  locations: LocationDoc[];
};

export function useTrashFilters(
  trashData: TrashDataPayload | undefined | null,
  activeTab: TrashType,
  debouncedSearch: string,
  currentFolderId: string | null,
  setCurrentPage: (page: number) => void,
  setCurrentFolderId: (id: string | null) => void,
) {
  const activeTabData = React.useMemo(() => {
    if (!trashData) return [];
    if (activeTab === "item") {
      const allItems = trashData.items.map((i: ItemDoc) => ({
        ...i,
        type: "item" as const,
      }));
      if (debouncedSearch) return allItems;

      if (currentFolderId) {
        return allItems.filter((i) => i.parentId === currentFolderId);
      }
      return allItems.filter((item) => {
        if (!item.parentId) return true;
        const isParentInTrash = allItems.some((i) => i._id === item.parentId);
        return !isParentInTrash;
      });
    }
    if (activeTab === "category")
      return trashData.categories.map((c: CategoryDoc) => ({
        ...c,
        type: "category" as const,
      }));
    if (activeTab === "location")
      return trashData.locations.map((l: LocationDoc) => ({
        ...l,
        type: "location" as const,
      }));
    return [];
  }, [trashData, activeTab, debouncedSearch, currentFolderId]);

  const filteredTrash = React.useMemo(() => {
    if (!debouncedSearch) return activeTabData;
    // Server has already filtered items via global search!
    if (activeTab === "item") return activeTabData;

    // Fallback for categories/locations
    return activeTabData.filter((item: TrashedItem) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [activeTabData, debouncedSearch, activeTab]);

  // Professional Fix: Reset pagination safely outside the render phase
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, currentFolderId, setCurrentPage]);

  const totalTrashCount =
    (trashData?.items?.length || 0) +
    (trashData?.categories?.length || 0) +
    (trashData?.locations?.length || 0);

  const handleBackFolder = React.useCallback(() => {
    const current = trashData?.items.find(
      (i: ItemDoc) => i._id === currentFolderId,
    );
    if (current && current.parentId) {
      const parentInTrash = trashData?.items.find(
        (i: ItemDoc) => i._id === current.parentId,
      );
      if (parentInTrash) return setCurrentFolderId(current.parentId);
    }
    setCurrentFolderId(null);
  }, [trashData, currentFolderId, setCurrentFolderId]);

  return { activeTabData, filteredTrash, totalTrashCount, handleBackFolder };
}
