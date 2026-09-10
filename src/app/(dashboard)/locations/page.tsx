// src/app/(dashboard)/locations/page.tsx
"use client";

import * as React from "react";
import { HardDrive, Loader2, XCircle, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LocationHeader } from "@/features/locations/components/LocationHeader";
import { LocationGrid } from "@/features/locations/components/LocationGrid";
import { LocationListRow } from "@/features/locations/components/LocationListRow";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LocationFormDialog } from "@/features/locations/components/LocationFormDialog";
import { LocationDeleteModals } from "@/features/locations/components/LocationDeleteModals";
import { usePaginatedLocations } from "@/features/locations/hooks/useLocations";
import { LocationFormData } from "@/features/locations/types";
import { LocationDoc } from "@/features/locations/components/LocationCard";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Pagination } from "@/shared/components/Pagination";

export default function LocationsPage() {
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const {
    locations,
    isLoading,
    paginationStatus,
    loadMore,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = usePaginatedLocations(itemsPerPage);

  const counts = useQuery(api.items.getGlobalCounts);
  const locationCounts = counts?.locationCounts || {};
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      const savedView = localStorage.getItem("knot-location-view") as
        "grid" | "list";
      if (savedView === "grid" || savedView === "list") {
        setView(savedView);
      }
    });
  }, []);

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("knot-location-view", newView);
  };

  const activeView = mounted ? view : "grid";
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [loadedCount, setLoadedCount] = React.useState(10);

  const searchResults = useQuery(
    api.locations.searchLocations,
    debouncedSearchTerm ? { query: debouncedSearchTerm } : "skip",
  );
  const isSearching = !!debouncedSearchTerm;
  const isSearchLoading = isSearching && searchResults === undefined;
  const uiStorageKey = `knot_ui_loaded_locations`;

  const handleSearchChange = React.useCallback(
    (term: string) => {
      setSearchTerm(term);
      setLoadedCount(itemsPerPage);
    },
    [itemsPerPage],
  );

  // Restore UI slice state on mount
  React.useEffect(() => {
    setTimeout(() => {
      const saved = sessionStorage.getItem(uiStorageKey);
      if (saved) setLoadedCount(Number(saved));
      else setLoadedCount(10);
    }, 0);
  }, [uiStorageKey]);

  // 1. Auto-fill list
  React.useEffect(() => {
    if (
      !isSearching &&
      paginationStatus === "CanLoadMore" &&
      locations &&
      locations.length < loadedCount
    ) {
      loadMore(loadedCount - locations.length);
    }
  }, [locations, loadedCount, isSearching, paginationStatus, loadMore]);

  // 2. Save scroll position
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const scrollKey = `knot_scroll_locations`;
    const handleScroll = () =>
      sessionStorage.setItem(scrollKey, String(mainEl.scrollTop));
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Restore scroll position
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl || isLoading) return;
    const scrollKey = `knot_scroll_locations`;
    const savedScroll = sessionStorage.getItem(scrollKey);
    if (savedScroll) {
      const timer = setTimeout(() => {
        mainEl.scrollTop = Number(savedScroll);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Modals & Forms State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] =
    React.useState<LocationDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [locationToDelete, setLocationToDelete] = React.useState<string | null>(
    null,
  );

  // DB Search & Load More Math
  const currentLocations = isSearching
    ? searchResults || []
    : locations?.slice(0, loadedCount) || [];
  const hasMoreToLoad =
    !isSearching &&
    ((locations && locations.length > loadedCount) ||
      paginationStatus === "CanLoadMore" ||
      paginationStatus === "LoadingMore");

  // Handlers
  const openNewDialog = () => {
    setEditingLocation(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (location: LocationDoc) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setLocationToDelete(id);
  };

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      if (editingLocation) {
        await handleUpdate(editingLocation._id, data);
      } else {
        await handleCreate(data);
      }
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasNoLocationsAtAll = locations && locations.length === 0;
  const hasNoSearchResults =
    locations &&
    locations.length > 0 &&
    isSearching &&
    !isSearchLoading &&
    currentLocations.length === 0;

  return (
    <div className="flex flex-col animate-in fade-in-50 duration-500 w-full h-full relative">
      {/* Sticky Header Layer with Negative Margin Bleed */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pb-2 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 -mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50">
        <LocationHeader
          hasLocations={!!locations && locations.length > 0}
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
          view={activeView}
          handleViewChange={handleViewChange}
          openNewDialog={openNewDialog}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-4 px-1">
        {isLoading || isSearchLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
          </div>
        ) : hasNoLocationsAtAll ? (
          <EmptyState
            icon={HardDrive}
            title="No locations yet"
            description="Create your first storage location to start tracking your files."
            action={
              <Button
                onClick={openNewDialog}
                className="rounded-full px-6 h-11 font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Location
              </Button>
            }
          />
        ) : hasNoSearchResults ? (
          <EmptyState
            icon={XCircle}
            title="No results found"
            description={`We couldn't find any location matching "${searchTerm}".`}
            action={
              <Button
                variant="outline"
                onClick={() => handleSearchChange("")}
                className="rounded-full px-6 h-11 font-semibold border-border/80 hover:bg-muted"
              >
                Clear Search
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Grid / List Views */}
            {activeView === "grid" ? (
              <LocationGrid
                locations={currentLocations}
                locationCounts={locationCounts}
                onEdit={openEditDialog}
                onDelete={confirmDelete}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {currentLocations.map((loc) => (
                  <LocationListRow
                    key={loc._id}
                    location={loc}
                    itemCount={locationCounts[loc._id] || 0}
                    onEdit={openEditDialog}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            )}

            {/* Load More Component */}
            {!isSearching && (
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
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <LocationFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={onSubmit}
        initialData={editingLocation}
        isLoading={isSubmitting}
      />

      <LocationDeleteModals
        locationToDelete={locationToDelete}
        setLocationToDelete={setLocationToDelete}
        locationCounts={locationCounts}
        handleDelete={handleDelete}
      />
    </div>
  );
}
