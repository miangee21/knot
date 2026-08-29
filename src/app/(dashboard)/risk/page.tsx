//src/app/(dashboard)/risk/page.tsx
"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { RiskFilters } from "@/features/risk/components/RiskFilters";
import { SearchBar } from "@/shared/components/SearchBar";
import { Pagination } from "@/shared/components/Pagination";
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
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>(
    [],
  );

  // Dropdown Search State
  const [categorySearch, setCategorySearch] = React.useState("");
  const [locationSearch, setLocationSearch] = React.useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  // Fetch Custom Server-Paginated Data
  const {
    riskItems,
    totalGlobalCount,
    hasFilters,
    isLoading,
    status: paginationStatus,
    loadMore,
  } = useRiskAnalysis(
    itemsPerPage,
    searchTerm,
    selectedCategory,
    selectedLocations,
  );

  // Professional React 18: Render-Phase State Correction
  const totalItems = riskItems.length;
  const isAll = itemsPerPage === "all";
  const maxPage = isAll
    ? 1
    : Math.max(1, Math.ceil(totalItems / (itemsPerPage as number)));

  // Do not reset page if we are currently loading more items from the server
  const hasMoreToLoad =
    (paginationStatus === "CanLoadMore" ||
      paginationStatus === "LoadingMore") &&
    !hasFilters;

  // Professional React 18: Derive state during render instead of forced state updates
  const safeCurrentPage =
    currentPage > maxPage && !hasMoreToLoad && totalItems > 0
      ? maxPage
      : currentPage;
  const startIndex = isAll
    ? 0
    : (safeCurrentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);
  const currentItems = riskItems.slice(startIndex, endIndex);

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
    setSelectedLocations([]); // Clear locations if category is used
    setCurrentPage(1);
  };

  const handleLocationToggle = (locId: string) => {
    setSelectedCategory(null); // Clear category if location is used
    setSelectedLocations((prev) =>
      prev.includes(locId)
        ? prev.filter((id) => id !== locId)
        : [...prev, locId],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocations([]);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-4">
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

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search at-risk items..."
              className="w-full sm:w-56"
            />
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Filter Dropdowns Area */}
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
            setCurrentPage={setCurrentPage}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-2 min-h-0">
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
                onEditClick={() => {}} // Disabled here, they should use details to edit
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

            {totalItems > 0 && (
              <div className="mt-2">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={safeCurrentPage}
                  hasMore={paginationStatus === "CanLoadMore" && !hasFilters}
                  onPageChange={(newPage) => {
                    if (itemsPerPage !== "all") {
                      const newStartIndex = (newPage - 1) * itemsPerPage;
                      if (
                        newStartIndex >= riskItems.length &&
                        paginationStatus === "CanLoadMore" &&
                        !hasFilters
                      ) {
                        loadMore(itemsPerPage);
                      }
                    }
                    setCurrentPage(newPage);
                  }}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
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
