//src/features/trash/components/TrashItemCards.tsx
"use client";

import { RefreshCcw, Trash2, MoreVertical, Info } from "lucide-react";
import { ItemThumbnail } from "@/features/items/components/browser/ItemThumbnail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ItemDoc, CategoryDoc, LocationDoc } from "@/features/items/types";

type TrashType = "item" | "category" | "location";
type TrashItemBase = {
  type: TrashType;
  name: string;
  _id: string;
  deletedAt: number;
};
type TrashedItem = (ItemDoc | CategoryDoc | LocationDoc) & TrashItemBase;

interface TrashItemCardProps {
  item: TrashedItem;
  onRestore: (item: TrashedItem) => void;
  onDelete: (item: TrashedItem) => void;
  onFolderClick: (id: string) => void;
  onDetailsClick: (item: ItemDoc) => void; // Using ItemDoc for detail modal compatibility
  viewMode: "grid" | "list";
}

export function TrashItemCards({
  item,
  onRestore,
  onDelete,
  onFolderClick,
  onDetailsClick,
  viewMode,
}: TrashItemCardProps) {
  const itemDoc = item as unknown as ItemDoc;
  const isFolder = itemDoc.isFolder;

  const handleCardClick = () => {
    if (isFolder) onFolderClick(item._id);
  };

  const Actions = () => (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRestore(item);
        }}
        className="p-1.5 text-primary/80 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
        title="Restore"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        className="p-1.5 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        title="Permanent Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const ThreeDotsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-muted transition-colors shadow-sm outline-none cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border-border bg-card shadow-lg p-1.5"
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDetailsClick(item as unknown as ItemDoc);
          }}
          className="rounded-lg cursor-pointer py-2 px-2.5 font-medium hover:bg-muted"
        >
          <Info className="w-4 h-4 mr-2.5 text-muted-foreground" /> Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "grid") {
    return (
      <div
        onClick={handleCardClick}
        className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-2.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg ${isFolder ? "cursor-pointer" : ""}`}
      >
        <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/30">
          <ItemThumbnail
            posterUrl={itemDoc.posterUrl}
            isFolder={isFolder}
            className="w-full h-full"
          />
          <div className="absolute top-2 right-2 z-20">
            <ThreeDotsMenu />
          </div>
        </div>
        <div className="px-1 pt-2.5 pb-1 flex flex-col min-w-0">
          <p className="truncate w-full text-[13px] font-bold text-foreground">
            {item.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-muted-foreground font-medium truncate">
              {item.deletedAt
                ? new Date(item.deletedAt).toLocaleDateString()
                : "Unknown"}
            </p>
            <Actions />
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      onClick={handleCardClick}
      className={`group flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md ${isFolder ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative h-12 w-10 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/40">
          <ItemThumbnail
            posterUrl={itemDoc.posterUrl}
            isFolder={isFolder}
            className="w-full h-full"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="truncate text-[14px] font-bold text-foreground">
            {item.name}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Deleted on{" "}
            {item.deletedAt
              ? new Date(item.deletedAt).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Actions />
        <div className="ml-1">
          <ThreeDotsMenu />
        </div>
      </div>
    </div>
  );
}
