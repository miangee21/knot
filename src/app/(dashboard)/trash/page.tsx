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
import { TAB_CONFIG } from "@/features/trash/hooks/useTrashFilters";

type TrashedAsset = (ItemDoc | CategoryDoc | LocationDoc) & {
  type: "item" | "category" | "location";
  name: string;
  _id: string;
};

export default function TrashPage() {
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = React.useState<
    "item" | "category" | "location"
  >("item");

  const [loadedCount, setLoadedCount] = React.useState(10);
  const uiStorageKey = `knot_ui_loaded_trash_${activeTab}`;

  const {
    currentItems: rawItems,
    counts,
    isLoading,
    status: paginationStatus,
    loadMore,
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  } = useTrash(activeTab, itemsPerPage, debouncedSearch);

  const { viewMode, setViewMode } = useViewPreference();
  const { categories } = useCategories();
  const { locations } = useLocations();

  React.useEffect(() => {
    setTimeout(() => {
      const saved = sessionStorage.getItem(uiStorageKey);
      if (saved) setLoadedCount(Number(saved));
      else setLoadedCount(10);
    }, 0);
  }, [uiStorageKey, activeTab]);

  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl || isLoading) return;
    const scrollKey = `knot_scroll_trash_${activeTab}`;
    const savedScroll = sessionStorage.getItem(scrollKey);
    if (savedScroll) {
      const timer = setTimeout(() => {
        mainEl.scrollTop = Number(savedScroll);
      }, 100);
      return () => clearTimeout(timer);
    }
    const handleScroll = () =>
      sessionStorage.setItem(scrollKey, String(mainEl.scrollTop));
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [isLoading, activeTab]);

  const isSearching = !!debouncedSearch;

  // Auto-fill list when items are restored or deleted
  React.useEffect(() => {
    if (
      !isSearching &&
      paginationStatus === "CanLoadMore" &&
      rawItems &&
      rawItems.length < loadedCount
    ) {
      loadMore(loadedCount - rawItems.length);
    }
  }, [rawItems, loadedCount, isSearching, paginationStatus, loadMore]);

  const currentItems = (rawItems?.slice(0, loadedCount) ||
    []) as unknown as TrashedAsset[];
  const hasMoreToLoad =
    !isSearching &&
    ((rawItems?.length || 0) > loadedCount ||
      paginationStatus === "CanLoadMore" ||
      paginationStatus === "LoadingMore");

  const totalTrashCount =
    (counts?.items || 0) + (counts?.categories || 0) + (counts?.locations || 0);

  const [detailItem, setDetailItem] = React.useState<ItemDoc | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<TrashedAsset | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [itemToRestore, setItemToRestore] = React.useState<TrashedAsset | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isEmptyBinOpen, setIsEmptyBinOpen] = React.useState(false);
  const [isEmptying, setIsEmptying] = React.useState(false);

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
    } finally {
      setIsEmptying(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in-50 duration-500 w-full h-full relative pb-2">
      {/* Sticky Header Layer with Negative Margin Bleed */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 -mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50 pb-2">
        <TrashHeader
          totalTrashCount={totalTrashCount}
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab as typeof activeTab)}
          tabConfig={TAB_CONFIG}
          counts={counts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setIsEmptyBinOpen={setIsEmptyBinOpen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-4 mt-4 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : (
          <TrashContentArea
            totalTrashCount={totalTrashCount}
            activeTab={activeTab}
            viewMode={viewMode}
            setSearchTerm={setSearchTerm}
            currentItems={currentItems}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={(val) => setItemsPerPage(val as number)}
            setItemToRestore={setItemToRestore}
            setItemToDelete={setItemToDelete}
            setDetailItem={setDetailItem}
            hasMore={hasMoreToLoad}
            onLoadMore={() => {
              const newCount = loadedCount + itemsPerPage;
              setLoadedCount(newCount);
              sessionStorage.setItem(uiStorageKey, String(newCount));
              loadMore(itemsPerPage);
            }}
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
