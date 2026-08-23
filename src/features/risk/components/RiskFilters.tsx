//src/features/risk/components/RiskFilters.tsx
"use client";

import { Check, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

interface RiskFiltersProps {
  categories: any[];
  locations: any[];
  selectedCategory: string | null;
  selectedLocations: string[];
  categorySearch: string;
  setCategorySearch: (val: string) => void;
  locationSearch: string;
  setLocationSearch: (val: string) => void;
  handleCategoryChange: (id: string) => void;
  handleLocationToggle: (id: string) => void;
  clearFilters: () => void;
  setSelectedCategory: (val: string | null) => void;
  setSelectedLocations: (val: string[]) => void;
  setCurrentPage: (val: number) => void;
  searchTerm: string;
}

export function RiskFilters({
  categories,
  locations,
  selectedCategory,
  selectedLocations,
  categorySearch,
  setCategorySearch,
  locationSearch,
  setLocationSearch,
  handleCategoryChange,
  handleLocationToggle,
  clearFilters,
  setSelectedCategory,
  setSelectedLocations,
  setCurrentPage,
  searchTerm,
}: RiskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-2">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">
          Filters:
        </span>
      </div>

      {/* Category Dropdown */}
      <DropdownMenu onOpenChange={(open) => !open && setCategorySearch("")}>
        <DropdownMenuTrigger
          className={`inline-flex items-center justify-center h-9 rounded-full border border-border/80 text-sm font-semibold px-4 gap-2 outline-none transition-colors ${selectedCategory ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          Category:{" "}
          {selectedCategory
            ? categories?.find((c) => c._id === selectedCategory)?.name
            : "All"}
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 rounded-xl border-border bg-card p-1.5 shadow-xl flex flex-col max-h-80"
        >
          <div className="px-2 pb-2 pt-1 sticky top-0 bg-card z-10">
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-8 bg-muted/50 border border-border/60 rounded-md px-3 text-xs outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar">
            <DropdownMenuItem
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage(1);
              }}
              className="rounded-lg cursor-pointer py-2 px-3 font-medium"
            >
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60 my-1 mx-1" />
            {categories
              ?.filter((c) =>
                c.name.toLowerCase().includes(categorySearch.toLowerCase()),
              )
              .map((cat) => (
                <DropdownMenuItem
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat._id)}
                  className="rounded-lg cursor-pointer py-2 px-3 font-medium flex items-center justify-between"
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  {selectedCategory === cat._id && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            {categories?.filter((c) =>
              c.name.toLowerCase().includes(categorySearch.toLowerCase()),
            ).length === 0 && (
              <div className="py-3 text-center text-xs text-muted-foreground">
                No categories found
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location Dropdown */}
      <DropdownMenu onOpenChange={(open) => !open && setLocationSearch("")}>
        <DropdownMenuTrigger
          className={`inline-flex items-center justify-center h-9 rounded-full border border-border/80 text-sm font-semibold px-4 gap-2 outline-none transition-colors ${selectedLocations.length > 0 ? "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          Locations:{" "}
          {selectedLocations.length > 0
            ? `${selectedLocations.length} Selected`
            : "All"}
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 rounded-xl border-border bg-card p-1.5 shadow-xl flex flex-col max-h-80"
        >
          <div className="px-2 pb-2 pt-1 sticky top-0 bg-card z-10">
            <input
              type="text"
              placeholder="Search locations..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-8 bg-muted/50 border border-border/60 rounded-md px-3 text-xs outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar">
            <DropdownMenuItem
              onClick={() => {
                setSelectedLocations([]);
                setCurrentPage(1);
              }}
              className="rounded-lg cursor-pointer py-2 px-3 font-medium"
            >
              All Locations
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60 my-1 mx-1" />
            {locations
              ?.filter((l) =>
                l.name.toLowerCase().includes(locationSearch.toLowerCase()),
              )
              .map((loc) => (
                <DropdownMenuItem
                  key={loc._id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLocationToggle(loc._id);
                  }}
                  className="rounded-lg cursor-pointer py-2 px-3 font-medium flex items-center justify-between"
                >
                  <span className="truncate pr-2">{loc.name}</span>
                  {selectedLocations.includes(loc._id) && (
                    <Check className="w-4 h-4 text-destructive shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            {locations?.filter((l) =>
              l.name.toLowerCase().includes(locationSearch.toLowerCase()),
            ).length === 0 && (
              <div className="py-3 text-center text-xs text-muted-foreground">
                No locations found
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Button */}
      {(selectedCategory || selectedLocations.length > 0 || searchTerm) && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
