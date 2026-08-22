//src/features/items/components/browser/ViewToggle.tsx
"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onViewChange: (mode: "grid" | "list") => void;
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center p-1 bg-muted/40 border border-border/80 rounded-xl">
      <button
        onClick={() => onViewChange("grid")}
        className={cn(
          "p-2 rounded-lg transition-all flex items-center justify-center",
          viewMode === "grid"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Grid View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "p-2 rounded-lg transition-all flex items-center justify-center",
          viewMode === "list"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="List View"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
