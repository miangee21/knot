// src/app/(dashboard)/locations/page.tsx
"use client";

import * as React from "react";
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  HardDrive,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LocationGrid } from "@/features/locations/components/LocationGrid";
import { LocationListRow } from "@/features/locations/components/LocationListRow";
import { LocationFormDialog } from "@/features/locations/components/LocationFormDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { LocationFormData } from "@/features/locations/types";
import { LocationDoc } from "@/features/locations/components/LocationCard";

export default function LocationsPage() {
  const { locations, isLoading, handleCreate, handleUpdate, handleDelete } =
    useLocations();

  // Initialize view state, checking localStorage first (safely for Next.js SSR)
  const [view, setView] = React.useState<"grid" | "list">("grid");

  React.useEffect(() => {
    const savedView = localStorage.getItem("knot-location-view") as
      "grid" | "list";
    if (savedView === "grid" || savedView === "list") {
      setView(savedView);
    }
  }, []);

  // Update view and save to localStorage
  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("knot-location-view", newView);
  };

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] =
    React.useState<LocationDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete Confirmation State
  const [locationToDelete, setLocationToDelete] = React.useState<string | null>(
    null,
  );

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

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in-50 duration-500 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Locations
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Manage your physical and cloud storage drives.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {locations && locations.length > 0 && (
            <div className="flex items-center bg-card border border-border/50 rounded-full p-1 shadow-sm">
              <button
                onClick={() => handleViewChange("grid")}
                className={`p-2 rounded-full transition-all ${view === "grid" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewChange("list")}
                className={`p-2 rounded-full transition-all ${view === "list" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <Button
            onClick={openNewDialog}
            className="flex-1 sm:flex-none rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:-translate-y-px transition-all h-11 px-5"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Location
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {!locations || locations.length === 0 ? (
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
        ) : view === "grid" ? (
          <LocationGrid
            locations={locations}
            onEdit={openEditDialog}
            onDelete={confirmDelete}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {locations.map((loc) => (
              <LocationListRow
                key={loc._id}
                location={loc}
                onEdit={openEditDialog}
                onDelete={confirmDelete}
              />
            ))}
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

      <ConfirmDialog
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={() => locationToDelete && handleDelete(locationToDelete)}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
      />
    </div>
  );
}
