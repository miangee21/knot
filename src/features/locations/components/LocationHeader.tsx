//src/features/locations/components/LocationHeader.tsx
"use client";

import { LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SearchBar } from "@/shared/components/SearchBar";

interface LocationHeaderProps {
  hasLocations: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  view: "grid" | "list";
  handleViewChange: (view: "grid" | "list") => void;
  openNewDialog: () => void;
}

export function LocationHeader({
  hasLocations,
  searchTerm,
  setSearchTerm,
  view,
  handleViewChange,
  openNewDialog,
}: LocationHeaderProps) {
  return (
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
        {hasLocations && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search locations..."
            className="sm:w-64"
          />
        )}

        {/* View Toggles */}
        {hasLocations && (
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
  );
}
