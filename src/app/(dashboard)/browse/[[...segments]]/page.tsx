//src/app/(dashboard)/browse/[[...segments]]/page.tsx
"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, PackageOpen } from "lucide-react";
// Shared Components
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Pagination } from "@/shared/components/Pagination";
import { ItemDoc } from "@/features/items/types";
// Browser UI Components
import { BrowseHeader } from "@/features/items/components/browser/BrowseHeader";
import { ItemGrid } from "@/features/items/components/browser/ItemGrid";
import { ItemListTable } from "@/features/items/components/browser/ItemListTable";
import { BrowseModals } from "@/features/items/components/browser/BrowseModals";
// Hooks
import { useItemChildren } from "@/features/items/hooks/useItemChildren";
import { useItemAncestors } from "@/features/items/hooks/useItemAncestors";
import { useViewPreference } from "@/features/items/hooks/useViewPreference";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useBrowseFilters,
  useBrowseMutations,
} from "@/features/items/hooks/useBrowseLogic";

export default function BrowsePage() {
  // Navigation & Route State
  const params = useParams();
  const searchParams = useSearchParams();
  const locationFilterId = searchParams.get("locationFilterId");
  const segments = params.segments as string[] | undefined;

  // Get currentParentId from the last segment in the URL
  const currentParentId = (
    segments && segments.length > 0 ? segments[segments.length - 1] : null
  ) as Id<"items"> | null;
  const currentPath = segments ? `/browse/${segments.join("/")}` : "/browse";
  const { viewMode, setViewMode } = useViewPreference();

  // Pagination & Load More State
  const [loadedCount, setLoadedCount] = React.useState(10);
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const uiStorageKey = `knot_ui_loaded_${currentParentId || "root"}`;

  // Restore UI slice state on mount or folder change
  React.useEffect(() => {
    setTimeout(() => {
      const saved = sessionStorage.getItem(uiStorageKey);
      if (saved) setLoadedCount(Number(saved));
      else setLoadedCount(10);
    }, 0);
  }, [uiStorageKey]);

  // Data Hooks
  const { ancestors, isLoading: ancestorsLoading } = useItemAncestors(
    currentParentId ?? undefined,
  );
  const {
    children: items,
    isLoading: itemsLoading,
    status: paginationStatus,
    loadMore,
  } = useItemChildren(currentParentId, itemsPerPage);
  const { categories } = useCategories();
  const { locations } = useLocations();

  // Compute inherited locations from ancestors for new items
  const inheritedLocationIds = React.useMemo(() => {
    if (!ancestors) return [];
    const locSet = new Set<string>();
    ancestors.forEach((anc: ItemDoc) => {
      if (anc.locationIds) {
        anc.locationIds.forEach((id: string) => locSet.add(id));
      }
    });
    return Array.from(locSet);
  }, [ancestors]);

  // Search State
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearchChange = React.useCallback(
    (term: string) => {
      setSearchTerm(term);
      setLoadedCount(itemsPerPage);
    },
    [itemsPerPage],
  );

  React.useEffect(() => {
    if (
      !debouncedSearchTerm &&
      !locationFilterId &&
      paginationStatus === "CanLoadMore" &&
      items &&
      items.length < loadedCount
    ) {
      loadMore(loadedCount - items.length);
    }
  }, [
    items,
    loadedCount,
    debouncedSearchTerm,
    locationFilterId,
    paginationStatus,
    loadMore,
  ]);

  // 2. Save scroll position
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    const scrollKey = `knot_scroll_${currentParentId || "root"}`;
    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, String(mainEl.scrollTop));
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [currentParentId]);

  // 3. Restore scroll position
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl || itemsLoading || ancestorsLoading) return;

    const scrollKey = `knot_scroll_${currentParentId || "root"}`;
    const savedScroll = sessionStorage.getItem(scrollKey);

    if (savedScroll) {
      const timer = setTimeout(() => {
        mainEl.scrollTop = Number(savedScroll);
      }, 100); // Slight delay for DOM paint
      return () => clearTimeout(timer);
    }
  }, [itemsLoading, ancestorsLoading, currentParentId]);

  // Custom Hook: Modals & Mutations
  const {
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
  } = useBrowseMutations();

  // Custom Hook: Filters & Pagination
  const { isSearching, hasMoreToLoad, currentItems } = useBrowseFilters(
    items,
    locationFilterId,
    searchTerm,
    debouncedSearchTerm,
    itemsPerPage,
    loadedCount,
    paginationStatus,
  );

  return (
    <div className="flex flex-col animate-in fade-in-50 duration-500 w-full h-full relative">
      {/* Sticky Header Layer with Negative Margin Bleed for Seamless Sticking */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pb-0 pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 -mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50">
        <BrowseHeader
          locationFilterId={locationFilterId}
          currentPath={currentPath}
          ancestors={ancestors || []}
          ancestorsLoading={ancestorsLoading}
          items={(items || []).filter((i): i is ItemDoc => i !== null)}
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          openNewDialog={openNewDialog}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-2 mt-4 px-1">
        {itemsLoading || ancestorsLoading || isSearching ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : currentItems && currentItems.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title={searchTerm ? "No results found" : "This folder is empty"}
            description={
              searchTerm
                ? "Try adjusting your search."
                : "Create your first item or folder here to start organizing."
            }
            action={
              !searchTerm && (
                <Button
                  onClick={openNewDialog}
                  className="rounded-full px-6 h-11 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Item Here
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Dynamic Rendering based on ViewMode */}
            {viewMode === "grid" ? (
              <ItemGrid
                items={currentItems.filter((i): i is ItemDoc => i !== null)}
                currentPath={currentPath}
                allLocations={locations || []}
                onDetailsClick={handleItemClick}
                onEditClick={(item) => {
                  setEditingItem(item);
                  setIsFormOpen(true);
                }}
                onDeleteClick={(item) => {
                  setItemToDelete(item);
                }}
                onMoveClick={(item) => setMovingItem(item)}
              />
            ) : (
              <ItemListTable
                items={currentItems.filter((i): i is ItemDoc => i !== null)}
                currentPath={currentPath}
                allLocations={locations || []}
                onDetailsClick={handleItemClick}
                onEditClick={(item) => {
                  setEditingItem(item);
                  setIsFormOpen(true);
                }}
                onDeleteClick={(item) => {
                  setItemToDelete(item);
                }}
                onMoveClick={(item) => setMovingItem(item)}
              />
            )}
            {/* Load More Component */}
            <div className="mt-2">
              <Pagination
                itemsPerPage={itemsPerPage}
                hasMore={hasMoreToLoad}
                onLoadMore={() => {
                  const newCount = loadedCount + itemsPerPage;
                  setLoadedCount(newCount);
                  sessionStorage.setItem(uiStorageKey, String(newCount));
                  if (!debouncedSearchTerm && !locationFilterId) {
                    loadMore(itemsPerPage);
                  }
                }}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                }}
              />
            </div>
          </>
        )}
      </div>
      {/* Unified Modals Component */}
      <BrowseModals
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        onFormSubmit={onFormSubmit}
        editingItem={editingItem}
        currentParentId={currentParentId}
        categories={categories || []}
        locations={locations || []}
        inheritedLocationIds={inheritedLocationIds}
        isSubmitting={isSubmitting}
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        onConfirmDelete={onConfirmDelete}
        movingItem={movingItem}
        setMovingItem={setMovingItem}
        detailItem={detailItem}
        setDetailItem={setDetailItem}
        ancestors={ancestors}
      />
    </div>
  );
}
