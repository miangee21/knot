//src/features/trash/components/TrashHeader.tsx
"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SearchBar } from "@/shared/components/SearchBar";
import { ViewToggle } from "@/features/items/components/browser/ViewToggle";
import { cn } from "@/shared/lib/utils";

type TrashType = "item" | "category" | "location";

interface TrashHeaderProps {
  totalTrashCount: number;
  activeTab: TrashType;
  setActiveTab: (tab: TrashType) => void;
  tabConfig: { id: TrashType; label: string; key: string }[];
  counts: { items: number; categories: number; locations: number } | undefined;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  setIsEmptyBinOpen: (val: boolean) => void;
}

export function TrashHeader({
  totalTrashCount,
  activeTab,
  setActiveTab,
  tabConfig,
  counts,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  setIsEmptyBinOpen,
}: TrashHeaderProps) {
  const activeTabConfig = tabConfig.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Trash2 className="w-8 h-8 text-primary" /> Recycle Bin
          </h1>
        </div>

        {/* Conditionally Show Tabs ONLY if trash is not empty */}
        {totalTrashCount > 0 && (
          <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl w-fit border border-border/60 overflow-x-auto custom-scrollbar">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                )}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-60">
                  ({counts?.[tab.key as keyof typeof counts] || 0})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto md:mt-10 shrink-0">
        {totalTrashCount > 0 && (
          <Button
            variant="outline"
            onClick={() => setIsEmptyBinOpen(true)}
            className="w-full sm:w-auto rounded-full font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Empty Bin
          </Button>
        )}
        {totalTrashCount > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search ${activeTabConfig?.label.toLowerCase()}...`}
            className="w-full sm:w-56"
          />
        )}
        {totalTrashCount > 0 && activeTab !== "category" && (
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        )}
      </div>
    </div>
  );
}
