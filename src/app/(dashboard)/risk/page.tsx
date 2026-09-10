//src/app/(dashboard)/risk/page.tsx
"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { RiskFilters } from "@/features/risk/components/RiskFilters";
import { SearchBar } from "@/shared/components/SearchBar";
import { Pagination } from "@/shared/components/Pagination";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { ViewToggle } from "@/features/items/components/browser/ViewToggle";
import { ItemGrid } from "@/features/items/components/browser/ItemGrid";
import { ItemListTable } from "@/features/items/components/browser/ItemListTable";
import { ItemDetailSheet } from "@/features/items/components/detail/ItemDetailSheet";
import { MoveItemDialog } from "@/features/items/components/browser/MoveItemDialog";
import { useRiskAnalysis } from "@/features/risk/hooks/useRiskAnalysis";
import { useViewPreference } from "@/features/items/hooks/useViewPreference";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { useItemAncestors } from "@/features/items/hooks/useItemAncestors";
import { ItemDoc } from "@/features/items/types";
import { Id } from "../../../../convex/_generated/dataModel";

export default function RiskPage() {
  const { viewMode, setViewMode } = useViewPreference();
  const { categories } = useCategories();
  const { locations } = useLocations();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>(
    [],
  );

  // Dropdown Search State
  const [categorySearch, setCategorySearch] = React.useState("");
  const [locationSearch, setLocationSearch] = React.useState("");

  // Pagination State & Math
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const [loadedCount, setLoadedCount] = React.useState(10);
  const uiStorageKey = `knot_ui_loaded_risk`;

  const {
    riskItems,
    totalGlobalCount,
    isLoading,
    status: paginationStatus,
    loadMore,
  } = useRiskAnalysis(
    itemsPerPage,
    debouncedSearchTerm,
    selectedCategory,
    selectedLocations,
  );

  React.useEffect(() => {
    setTimeout(() => {
      const saved = sessionStorage.getItem(uiStorageKey);
      if (saved) setLoadedCount(Number(saved));
      else setLoadedCount(10);
    }, 0);
  }, [uiStorageKey]);

  // Read-only page: No auto-fill needed. Just Scroll Restoration.
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl || isLoading) return;
    const scrollKey = `knot_scroll_risk`;
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
  }, [isLoading]);

  const currentItems = riskItems?.slice(0, loadedCount) || [];
  const hasMoreToLoad =
    (riskItems?.length || 0) > loadedCount ||
    paginationStatus === "CanLoadMore" ||
    paginationStatus === "LoadingMore";

  // Detail & Move Modal State
  const [detailItem, setDetailItem] = React.useState<ItemDoc | null>(null);
  const [movingItem, setMovingItem] = React.useState<ItemDoc | null>(null);

  // Fetch ancestors dynamically for the currently selected detail item
  const { ancestors } = useItemAncestors(
    detailItem?.parentId ? (detailItem.parentId as Id<"items">) : undefined,
  );

  // Handle Mutually Exclusive Filters
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    setSelectedLocations([]);
    setLoadedCount(itemsPerPage);
  };

  const handleLocationToggle = (locId: string) => {
    setSelectedCategory(null);
    setSelectedLocations((prev) =>
      prev.includes(locId)
        ? prev.filter((id) => id !== locId)
        : [...prev, locId],
    );
    setLoadedCount(itemsPerPage);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocations([]);
    setSearchTerm("");
    setLoadedCount(itemsPerPage);
  };

  return (
    <div className="flex flex-col animate-in fade-in-50 duration-500 w-full h-full relative">
      {/* Sticky Header Layer with Negative Margin Bleed */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md flex flex-col gap-4 pb-2 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 -mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Risk Analysis
              </h1>
              {totalGlobalCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 sm:mt-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-bold tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  {totalGlobalCount} items with no backup
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Files that exist in exactly one physical or cloud location.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0 md:mt-10">
            {/* Filter Dropdowns Area (Moved next to Search) */}
            {riskItems && riskItems.length > 0 && (
              <RiskFilters
                categories={categories || []}
                locations={locations || []}
                selectedCategory={selectedCategory}
                selectedLocations={selectedLocations}
                categorySearch={categorySearch}
                setCategorySearch={setCategorySearch}
                locationSearch={locationSearch}
                setLocationSearch={setLocationSearch}
                handleCategoryChange={handleCategoryChange}
                handleLocationToggle={handleLocationToggle}
                clearFilters={clearFilters}
                setSelectedCategory={setSelectedCategory}
                setSelectedLocations={setSelectedLocations}
                setCurrentPage={() => setLoadedCount(itemsPerPage)}
                searchTerm={searchTerm}
              />
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search at-risk items..."
                className="w-full sm:w-56"
              />
              <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-2 min-h-0 mt-4 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 rounded-full border-4 border-destructive/20 border-t-destructive animate-spin" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="w-full flex-1 flex flex-col justify-center">
            <EmptyState
              icon={ShieldAlert}
              title={totalGlobalCount === 0 ? "All Clear!" : "No results found"}
              description={
                totalGlobalCount === 0
                  ? "Excellent! All your files have backups and are stored in multiple locations."
                  : "Try adjusting your filters or search term."
              }
              action={
                (searchTerm ||
                  selectedCategory ||
                  selectedLocations.length > 0) && (
                  <Button
                    onClick={clearFilters}
                    className="rounded-full px-6 h-11 font-semibold"
                  >
                    Clear Filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <ItemGrid
                items={currentItems}
                currentPath="/browse" // Dummy path so link works if they click
                allLocations={locations || []}
                onDetailsClick={setDetailItem}
                onEditClick={() => {}} // Disabled here
                onDeleteClick={() => {}}
                onMoveClick={setMovingItem}
              />
            ) : (
              <ItemListTable
                items={currentItems}
                currentPath="/browse"
                allLocations={locations || []}
                onDetailsClick={setDetailItem}
                onEditClick={() => {}}
                onDeleteClick={() => {}}
                onMoveClick={setMovingItem}
              />
            )}

            <div className="mt-2">
              <Pagination
                itemsPerPage={itemsPerPage}
                hasMore={hasMoreToLoad}
                onLoadMore={() => {
                  const newCount = loadedCount + itemsPerPage;
                  setLoadedCount(newCount);
                  sessionStorage.setItem(uiStorageKey, String(newCount));
                  loadMore(itemsPerPage);
                }}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Reused Modals */}
      <MoveItemDialog
        item={movingItem}
        isOpen={!!movingItem}
        onClose={() => setMovingItem(null)}
      />

      <ItemDetailSheet
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        allLocations={locations || []}
        categories={categories || []}
        ancestors={ancestors}
      />
    </div>
  );
}
