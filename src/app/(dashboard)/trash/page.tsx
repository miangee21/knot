//src/app/(dashboard)/trash/page.tsx
"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import {
  Trash2,
  RefreshCcw,
  XCircle,
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
  Folder,
  Tag,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { SearchBar } from "@/shared/components/SearchBar";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useTrash } from "@/features/trash/hooks/useTrash";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { ViewToggle } from "@/features/items/components/browser/ViewToggle";
import { ItemThumbnail } from "@/features/items/components/browser/ItemThumbnail";
import { useViewPreference } from "@/features/items/hooks/useViewPreference";
import { cn } from "@/shared/lib/utils";

type TrashType = "item" | "category" | "location";

type TrashItem = {
  _id: string;
  name: string;
  type: TrashType;
  deletedAt?: number;
  isFolder?: boolean;
  icon?: string;
  posterUrl?: string; // Added for images
  kind?: string; // Added for locations
};

const TAB_CONFIG = [
  { id: "item" as TrashType, label: "Items", key: "items" },
  { id: "category" as TrashType, label: "Categories", key: "categories" },
  { id: "location" as TrashType, label: "Locations", key: "locations" },
];

const LOCATION_ICONS: Record<string, React.ElementType> = {
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
  Folder,
};

export default function TrashPage() {
  const {
    trashData,
    isLoading,
    handleRestore,
    handleHardDelete,
    handleEmptyBin,
  } = useTrash();
  const { viewMode, setViewMode } = useViewPreference();

  const [activeTab, setActiveTab] = React.useState<TrashType>("item");
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  const [itemToDelete, setItemToDelete] = React.useState<TrashItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [itemToRestore, setItemToRestore] = React.useState<TrashItem | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = React.useState(false);

  const [isEmptyBinOpen, setIsEmptyBinOpen] = React.useState(false);
  const [isEmptying, setIsEmptying] = React.useState(false);

  // Filter Data by Active Tab
  const activeTabData = React.useMemo(() => {
    if (!trashData) return [];
    if (activeTab === "item")
      return trashData.items.map((i: any) => ({ ...i, type: "item" }));
    if (activeTab === "category")
      return trashData.categories.map((c: any) => ({ ...c, type: "category" }));
    if (activeTab === "location")
      return trashData.locations.map((l: any) => ({ ...l, type: "location" }));
    return [];
  }, [trashData, activeTab]);

  // Search Filter
  const filteredTrash = React.useMemo(() => {
    if (!debouncedSearch) return activeTabData;
    return activeTabData.filter((item: TrashItem) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [activeTabData, debouncedSearch]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  // Pagination Math
  const totalItems = filteredTrash.length;
  const isAll = itemsPerPage === "all";
  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);
  const currentItems = filteredTrash.slice(startIndex, endIndex);

  const onConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await handleHardDelete(itemToDelete._id, itemToDelete.type);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const onConfirmRestore = async () => {
    if (!itemToRestore) return;
    setIsRestoring(true);
    try {
      await handleRestore(itemToRestore._id, itemToRestore.type);
      setItemToRestore(null);
    } finally {
      setIsRestoring(false);
    }
  };

  const onConfirmEmptyBin = async () => {
    setIsEmptying(true);
    try {
      await handleEmptyBin();
      setIsEmptyBinOpen(false);
    } finally {
      setIsEmptying(false);
    }
  };

  // Render premium icons based on original components
  const renderThumbnail = (item: TrashItem) => {
    if (item.type === "item") {
      return (
        <ItemThumbnail
          posterUrl={item.posterUrl}
          isFolder={item.isFolder}
          className="w-full h-full"
        />
      );
    }

    if (item.type === "category") {
      const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : Tag;
      return (
        <div className="flex h-full w-full items-center justify-center bg-secondary/80">
          <IconComponent className="w-6 h-6 text-foreground opacity-80" />
        </div>
      );
    }

    // For Location
    const IconComponent = item.icon ? LOCATION_ICONS[item.icon] : Folder;
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary/80">
        <IconComponent className="w-6 h-6 text-foreground opacity-80" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const activeTabConfig = TAB_CONFIG.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Trash2 className="w-8 h-8 text-primary" /> Recycle Bin
          </h1>

          {/* Premium Tabs with Fixed Spelling and Counts */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl w-fit border border-border/60 overflow-x-auto custom-scrollbar">
            {TAB_CONFIG.map((tab) => (
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
                  ({trashData?.[tab.key as keyof typeof trashData]?.length || 0}
                  )
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {trashData &&
            (trashData.items?.length || 0) +
              (trashData.categories?.length || 0) +
              (trashData.locations?.length || 0) >
              0 && (
              <Button
                variant="outline"
                onClick={() => setIsEmptyBinOpen(true)}
                className="w-full sm:w-auto rounded-full font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Empty Bin
              </Button>
            )}
          {activeTabData.length > 0 && (
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search ${activeTabConfig?.label.toLowerCase()}...`}
              className="w-full sm:w-56"
            />
          )}
          {activeTabData.length > 0 && (
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {activeTabData.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title={`No deleted ${activeTabConfig?.label.toLowerCase()}`}
            description={`Your recycle bin is clear of ${activeTabConfig?.label.toLowerCase()}.`}
          />
        ) : filteredTrash.length === 0 ? (
          <EmptyState
            icon={XCircle}
            title="No results found"
            description={`No deleted ${activeTabConfig?.label.toLowerCase()} match your search.`}
            action={
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="rounded-full"
              >
                Clear Search
              </Button>
            }
          />
        ) : (
          <>
            {/* GRID VIEW */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentItems.map((item) => (
                  <div
                    key={item._id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-2.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/30">
                      {renderThumbnail(item)}

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2.5 z-20">
                        <Button
                          size="sm"
                          onClick={() => setItemToRestore(item)}
                          className="w-28 rounded-full font-semibold shadow-md bg-white text-black hover:bg-gray-200"
                        >
                          <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setItemToDelete(item)}
                          className="w-28 rounded-full font-semibold shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                    <div className="px-1 pt-2.5 pb-1 flex flex-col items-center text-center">
                      <p className="truncate w-full text-[13px] font-bold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        Deleted:{" "}
                        {item.deletedAt
                          ? new Date(item.deletedAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="flex flex-col gap-3">
                {currentItems.map((item) => (
                  <div
                    key={item._id}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-12 w-10 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/40">
                        {renderThumbnail(item)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="truncate text-[14px] font-bold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Deleted on{" "}
                          {item.deletedAt
                            ? new Date(item.deletedAt).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setItemToRestore(item)}
                        className="h-8 rounded-full font-semibold px-4 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setItemToDelete(item)}
                        className="h-8 w-8 rounded-full p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Component */}
            {totalItems > 0 && (
              <div className="mt-2">
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
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Permanently Delete?"
        description={`Are you sure you want to permanently delete "${itemToDelete?.name}"? This action cannot be undone and files will be wiped from storage.`}
      />

      <ConfirmDialog
        isOpen={!!itemToRestore}
        onClose={() => !isRestoring && setItemToRestore(null)}
        onConfirm={onConfirmRestore}
        title="Restore Item"
        description={`Are you sure you want to restore "${itemToRestore?.name}"? It will be moved back to its original location.`}
      />

      <ConfirmDialog
        isOpen={isEmptyBinOpen}
        onClose={() => !isEmptying && setIsEmptyBinOpen(false)}
        onConfirm={onConfirmEmptyBin}
        title="Empty Recycle Bin?"
        description="Are you sure you want to permanently delete ALL items, categories, and locations in the recycle bin? This action cannot be undone and will permanently wipe associated files from storage."
      />
    </div>
  );
}
