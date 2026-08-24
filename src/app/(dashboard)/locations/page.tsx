// src/app/(dashboard)/locations/page.tsx
"use client";

import * as React from "react";
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  HardDrive,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LocationGrid } from "@/features/locations/components/LocationGrid";
import { LocationListRow } from "@/features/locations/components/LocationListRow";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { LocationFormDialog } from "@/features/locations/components/LocationFormDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { SearchBar } from "@/shared/components/SearchBar";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { LocationFormData } from "@/features/locations/types";
import { LocationDoc } from "@/features/locations/components/LocationCard";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Pagination } from "@/shared/components/Pagination";

export default function LocationsPage() {
  const { locations, isLoading, handleCreate, handleUpdate, handleDelete } =
    useLocations();
  const router = useRouter();
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

  // Reset to page 1 if user changes "items per page" dropdown
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const val = e.target.value;
    setItemsPerPage(val === "all" ? "all" : Number(val));
    setCurrentPage(1);
  };

  // Pagination Math
  const totalItems = filteredLocations.length;
  const isAll = itemsPerPage === "all";
  const totalPages = isAll
    ? 1
    : Math.ceil(totalItems / (itemsPerPage as number));
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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Locations
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Manage your physical and cloud storage drives.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          {locations && locations.length > 0 && (
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search locations..."
              className="sm:w-64"
            />
          )}

          {/* View Toggles */}
          {locations && locations.length > 0 && (
            <div className="flex items-center bg-card border border-border/50 rounded-full p-1 shadow-sm shrink-0">
              <button
                onClick={() => handleViewChange("grid")}
                className={`p-2 rounded-full transition-all ${
                  view === "grid"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewChange("list")}
                className={`p-2 rounded-full transition-all ${
                  view === "list"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <Button
            onClick={openNewDialog}
            className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:-translate-y-px transition-all h-11 px-5 shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Location
          </Button>
        </div>
      </div>

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
                onEdit={openEditDialog}
                onDelete={confirmDelete}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {currentLocations.map((loc) => (
                  <LocationListRow
                    key={loc._id}
                    location={loc}
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

      {/* Blocked Delete Dialog (If Items Exist) */}
      <Dialog
        open={!!locationToDelete && (locationCounts[locationToDelete] || 0) > 0}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" /> Cannot Delete
              Location
            </DialogTitle>
            <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
              This location cannot be deleted because it is currently linked to{" "}
              <span className="font-bold text-foreground">
                {locationToDelete ? locationCounts[locationToDelete] : 0}{" "}
                item(s)
              </span>
              . You must reassign or delete these items before removing this
              location.
            </div>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setLocationToDelete(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (locationToDelete) {
                  router.push(`/browse?locationFilterId=${locationToDelete}`);
                }
              }}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              View Linked Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Standard Delete Dialog (Move to Bin - If Empty) */}
      <ConfirmDialog
        isOpen={
          !!locationToDelete && (locationCounts[locationToDelete] || 0) === 0
        }
        onClose={() => setLocationToDelete(null)}
        onConfirm={async () => {
          if (locationToDelete) {
            try {
              await handleDelete(locationToDelete);
            } catch (e) {
              // Error handled by hook toast
            } finally {
              setLocationToDelete(null);
            }
          }
        }}
        title="Delete Location"
        description="Are you sure you want to move this location to the Recycle Bin?"
      />
    </div>
  );
}
