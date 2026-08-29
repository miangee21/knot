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
import {
  useTrashFilters,
  TrashType,
  TrashedItem,
  TAB_CONFIG,
  TrashDataPayload,
} from "@/features/trash/hooks/useTrashFilters";

export default function TrashPage() {
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    trashData,
    isLoading,
    status: paginationStatus,
    loadMore,
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  } = useTrash(itemsPerPage, debouncedSearch);
  const { viewMode, setViewMode } = useViewPreference();
  const { categories } = useCategories();
  const { locations } = useLocations();

  const [activeTab, setActiveTab] = React.useState<TrashType>("item");
  const [currentPage, setCurrentPage] = React.useState(1);

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

  const { activeTabData, filteredTrash, totalTrashCount, handleBackFolder } =
    useTrashFilters(
      trashData as unknown as TrashDataPayload,
      activeTab,
      debouncedSearch,
      currentFolderId,
      setCurrentPage,
      setCurrentFolderId,
    );

  // Professional React 18: Render-Phase State Correction (No useEffect)
  const totalItems = filteredTrash.length;
  const isAll = itemsPerPage === "all";
  const maxPage = isAll
    ? 1
    : Math.max(1, Math.ceil(totalItems / (itemsPerPage as number)));

  // Do not reset page if we are currently loading more items from the server
  const hasMoreToLoad =
    (paginationStatus === "CanLoadMore" ||
      paginationStatus === "LoadingMore") &&
    activeTab === "item" &&
    !debouncedSearch;

  // Professional React 18: Derive state during render instead of forced state updates
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
  const currentItems = filteredTrash.slice(startIndex, endIndex);

  // Auto-fill page if items are restored/deleted and we have more in DB
  React.useEffect(() => {
    if (
      itemsPerPage !== "all" &&
      activeTab === "item" &&
      !debouncedSearch &&
      paginationStatus === "CanLoadMore" &&
      totalItems > 0 &&
      currentItems.length < itemsPerPage &&
      currentPage === Math.ceil(totalItems / itemsPerPage)
    ) {
      loadMore(itemsPerPage);
    }
  }, [
    currentItems.length,
    itemsPerPage,
    activeTab,
    debouncedSearch,
    paginationStatus,
    loadMore,
    totalItems,
    currentPage,
  ]);

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

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      <TrashHeader
        totalTrashCount={totalTrashCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabConfig={TAB_CONFIG}
        trashData={
          trashData as unknown as {
            items: ItemDoc[];
            categories: CategoryDoc[];
            locations: LocationDoc[];
          }
        }
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsEmptyBinOpen={setIsEmptyBinOpen}
        currentFolderId={currentFolderId}
        onBack={handleBackFolder}
      />

      <div className="flex-1 flex flex-col space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : (
          <TrashContentArea
            totalTrashCount={totalTrashCount}
            activeTabDataLength={activeTabData.length}
            filteredTrashLength={filteredTrash.length}
            activeTab={activeTab}
            viewMode={viewMode}
            setSearchTerm={setSearchTerm}
            currentItems={currentItems}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={safeCurrentPage}
            setCurrentPage={(newPage) => {
              if (itemsPerPage !== "all" && activeTab === "item") {
                const newStartIndex = (newPage - 1) * itemsPerPage;
                if (
                  newStartIndex >= (trashData?.items.length || 0) &&
                  paginationStatus === "CanLoadMore" &&
                  !debouncedSearch
                ) {
                  loadMore(itemsPerPage);
                }
              }
              setCurrentPage(newPage);
            }}
            setItemsPerPage={setItemsPerPage}
            setItemToRestore={setItemToRestore}
            setItemToDelete={setItemToDelete}
            setCurrentFolderId={setCurrentFolderId}
            setDetailItem={setDetailItem}
            hasMore={
              paginationStatus === "CanLoadMore" &&
              activeTab === "item" &&
              !debouncedSearch
            }
          />
        )}
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
