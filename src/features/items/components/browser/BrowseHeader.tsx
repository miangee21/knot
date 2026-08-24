//src/features/items/components/browser/BrowseHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SearchBar } from "@/shared/components/SearchBar";
import { ItemBreadcrumb } from "./ItemBreadcrumb";
import { ViewToggle } from "./ViewToggle";

interface BrowseHeaderProps {
  locationFilterId: string | null;
  currentPath: string;
  ancestors: any[];
  ancestorsLoading: boolean;
  items: any[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  openNewDialog: () => void;
}

export function BrowseHeader({
  locationFilterId,
  currentPath,
  ancestors,
  ancestorsLoading,
  items,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  openNewDialog,
}: BrowseHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Browse
          </h1>
          {locationFilterId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mt-1">
              Location Filter Active
              <button
                onClick={() => router.push(currentPath)}
                className="ml-1 hover:text-destructive transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </span>
          )}
        </div>

        {/* Dynamic Breadcrumbs Component */}
        {!ancestorsLoading && <ItemBreadcrumb ancestors={ancestors} />}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {items && items.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search items..."
            className="w-full sm:w-56"
          />
        )}
        {/* Grid vs List Toggle */}
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        <Button
          onClick={openNewDialog}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:-translate-y-px transition-all h-11 px-6 w-full sm:w-auto shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Item
        </Button>
      </div>
    </div>
  );
}
