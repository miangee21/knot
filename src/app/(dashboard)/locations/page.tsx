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
import { useLocations } from "@/features/locations/hooks/useLocations";
import { LocationFormData } from "@/features/locations/types";
import { LocationDoc } from "@/features/locations/components/LocationCard";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Pagination } from "@/shared/components/Pagination";

export default function LocationsPage() {
  const { locations, isLoading, handleCreate, handleUpdate, handleDelete } =
    useLocations();
  const counts = useQuery(api.items.getGlobalCounts);
  const locationCounts = counts?.locationCounts || {};

  // View State (Grid or List)
  const [view, setView] = React.useState<"grid" | "list">("grid");

  React.useEffect(() => {
    const savedView = localStorage.getItem("knot-location-view") as
      "grid" | "list";
    if (savedView === "grid" || savedView === "list") {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("knot-location-view", newView);
  };

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  // Modals & Forms State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] =
    React.useState<LocationDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [locationToDelete, setLocationToDelete] = React.useState<string | null>(
    null,
  );

  // Filter Logic
  const filteredLocations = React.useMemo(() => {
    if (!locations) return [];
    if (!debouncedSearchTerm) return locations;

    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [locations, debouncedSearchTerm]);

  // Reset to page 1 if user searches
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Pagination Math
  const totalItems = filteredLocations.length;
  const isAll = itemsPerPage === "all";
  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);

  // The final slice of data to pass to the UI
  const currentLocations = filteredLocations.slice(startIndex, endIndex);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
      </div>
    );
  }

  const hasNoLocationsAtAll = locations && locations.length === 0;
  const hasNoSearchResults =
    locations && locations.length > 0 && filteredLocations.length === 0;

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in-50 duration-500 w-full">
      <LocationHeader
        hasLocations={!!locations && locations.length > 0}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        view={view}
        handleViewChange={handleViewChange}
        openNewDialog={openNewDialog}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {hasNoLocationsAtAll ? (
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
                onClick={() => setSearchTerm("")}
                className="rounded-full px-6 h-11 font-semibold border-border/80 hover:bg-muted"
              >
                Clear Search
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Grid / List Views */}
            {view === "grid" ? (
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

            {/* Pagination Controls */}
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
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
