//src/app/(dashboard)/trash/page.tsx
"use client";

import * as React from "react";
import { useTrash } from "@/features/trash/hooks/useTrash";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useViewPreference } from "@/features/items/hooks/useViewPreference";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { TrashHeader } from "@/features/trash/components/TrashHeader";
import { TrashModals } from "@/features/trash/components/TrashModals";
import { TrashContentArea } from "@/features/trash/components/TrashContentArea";
import { ItemDetailSheet } from "@/features/items/components/detail/ItemDetailSheet";
import { ItemDoc, CategoryDoc, LocationDoc } from "@/features/items/types";

type TrashType = "item" | "category" | "location";
type TrashItemBase = { type: TrashType; name: string; _id: string };
type TrashedItem = (ItemDoc | CategoryDoc | LocationDoc) & TrashItemBase;

const TAB_CONFIG = [
  { id: "item" as TrashType, label: "Items", key: "items" },
  { id: "category" as TrashType, label: "Categories", key: "categories" },
  { id: "location" as TrashType, label: "Locations", key: "locations" },
];

export default function TrashPage() {
  const {
    trashData,
    isLoading,
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  } = useTrash();
  const { viewMode, setViewMode } = useViewPreference();
  const { categories } = useCategories();
  const { locations } = useLocations();

  const [activeTab, setActiveTab] = React.useState<TrashType>("item");
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  const [detailItem, setDetailItem] = React.useState<ItemDoc | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<TrashedItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [itemToRestore, setItemToRestore] = React.useState<TrashedItem | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isEmptyBinOpen, setIsEmptyBinOpen] = React.useState(false);
  const [isEmptying, setIsEmptying] = React.useState(false);

  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(
    null,
  );

  const activeTabData = React.useMemo(() => {
    if (!trashData) return [];
    if (activeTab === "item") {
      const allItems = trashData.items.map((i: any) => ({
        ...i,
        type: "item",
      }));
      if (debouncedSearch) return allItems;

      if (currentFolderId) {
        return allItems.filter((i: any) => i.parentId === currentFolderId);
      }
      return allItems.filter((item: any) => {
        if (!item.parentId) return true;
        const isParentInTrash = allItems.some(
          (i: any) => i._id === item.parentId,
        );
        return !isParentInTrash;
      });
    }
    if (activeTab === "category")
      return trashData.categories.map((c: any) => ({ ...c, type: "category" }));
    if (activeTab === "location")
      return trashData.locations.map((l: any) => ({ ...l, type: "location" }));
    return [];
  }, [trashData, activeTab, debouncedSearch, currentFolderId]);

  const filteredTrash = React.useMemo(() => {
    if (!debouncedSearch) return activeTabData;
    return activeTabData.filter((item: any) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [activeTabData, debouncedSearch]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, currentFolderId]);

  const totalTrashCount =
    (trashData?.items?.length || 0) +
    (trashData?.categories?.length || 0) +
    (trashData?.locations?.length || 0);
  const totalItems = filteredTrash.length;
  const isAll = itemsPerPage === "all";
  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);
  const currentItems = filteredTrash.slice(startIndex, endIndex);

  const handleBackFolder = () => {
    const current = trashData?.items.find(
      (i: any) => i._id === currentFolderId,
    );
    if (current && current.parentId) {
      const parentInTrash = trashData?.items.find(
        (i: any) => i._id === current.parentId,
      );
      if (parentInTrash) return setCurrentFolderId(current.parentId);
    }
    setCurrentFolderId(null);
  };

  const onConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await handleHardDelete(itemToDelete._id, itemToDelete.type);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const onConfirmRestore = async () => {
    if (!itemToRestore) return;
    setIsRestoring(true);
    try {
      await handleRestore(itemToRestore._id, itemToRestore.type);
      setItemToRestore(null);
    } finally {
      setIsRestoring(false);
    }
  };

  const onConfirmEmptyBin = async () => {
    setIsEmptying(true);
    try {
      await handleEmptyBin();
      setIsEmptyBinOpen(false);
      setCurrentFolderId(null);
    } finally {
      setIsEmptying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      <TrashHeader
        totalTrashCount={totalTrashCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabConfig={TAB_CONFIG}
        trashData={trashData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsEmptyBinOpen={setIsEmptyBinOpen}
        currentFolderId={currentFolderId}
        onBack={handleBackFolder}
      />

      <div className="flex-1 flex flex-col space-y-4">
        <TrashContentArea
          totalTrashCount={totalTrashCount}
          activeTabDataLength={activeTabData.length}
          filteredTrashLength={filteredTrash.length}
          activeTab={activeTab}
          viewMode={viewMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentItems={currentItems}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          setItemToRestore={setItemToRestore}
          setItemToDelete={setItemToDelete}
          setCurrentFolderId={setCurrentFolderId}
          setDetailItem={setDetailItem}
        />
      </div>

      {detailItem && (
        <ItemDetailSheet
          item={detailItem}
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          allLocations={locations || []}
          categories={categories || []}
          ancestors={[]}
        />
      )}

      <TrashModals
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        onConfirmDelete={onConfirmDelete}
        isDeleting={isDeleting}
        itemToRestore={itemToRestore}
        setItemToRestore={setItemToRestore}
        onConfirmRestore={onConfirmRestore}
        isRestoring={isRestoring}
        isEmptyBinOpen={isEmptyBinOpen}
        setIsEmptyBinOpen={setIsEmptyBinOpen}
        onConfirmEmptyBin={onConfirmEmptyBin}
        isEmptying={isEmptying}
      />
    </div>
  );
}
