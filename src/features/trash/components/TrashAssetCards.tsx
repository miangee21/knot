//src/features/trash/components/TrashAssetCards.tsx
"use client";

import {
  MoreVertical,
  RefreshCcw,
  Trash2,
  Tag,
  Folder,
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { bytesToDisplay } from "@/features/locations/utils/formatBytes";
import { CapacityBar } from "@/features/locations/components/CapacityBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { CategoryDoc, LocationDoc, ItemDoc } from "@/features/items/types";

// Helper Type for Trash Items
type TrashType = "item" | "category" | "location";
type TrashItemBase = {
  type: TrashType;
  name: string;
  _id: string;
  deletedAt?: number;
};
type TrashedItem = (ItemDoc | CategoryDoc | LocationDoc) & TrashItemBase;

const LOCATION_ICONS: Record<string, React.ElementType> = {
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
  Folder,
};
const kindConfig = {
  hard: { label: "Hard Drive", className: "text-kind-hard bg-kind-hard/10" },
  cloud: { label: "Cloud", className: "text-kind-cloud bg-kind-cloud/10" },
  mobile: { label: "Mobile", className: "text-kind-mobile bg-kind-mobile/10" },
  os: { label: "OS Drive", className: "text-kind-os bg-kind-os/10" },
};

export function TrashCategoryCard({
  item,
  onRestore,
  onDelete,
}: {
  item: TrashedItem;
  onRestore: (item: TrashedItem) => void;
  onDelete: (item: TrashedItem) => void;
}) {
  const categoryItem = item as unknown as CategoryDoc & TrashItemBase;
  const IconComponent = categoryItem.icon
    ? (LucideIcons[
        categoryItem.icon as keyof typeof LucideIcons
      ] as React.ElementType)
    : Tag;

  return (
    <div className="group flex items-center justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-lg dark:bg-muted/10 dark:shadow-premium hover:border-primary/50 transition-all duration-300">
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 transition-all">
          <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-extrabold text-base text-foreground tracking-tight truncate">
            {item.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 opacity-80">
            Deleted:{" "}
            {item.deletedAt
              ? new Date(item.deletedAt).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors outline-none cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36 rounded-2xl p-1.5 border-border bg-card shadow-2xl"
        >
          <DropdownMenuItem
            onClick={() => onRestore(item)}
            className="rounded-xl cursor-pointer py-1.5 px-3 font-semibold hover:bg-muted text-primary"
          >
            <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Restore
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border h-px my-1 mx-1" />
          <DropdownMenuItem
            onClick={() => onDelete(item)}
            className="rounded-xl cursor-pointer py-1.5 px-3 font-semibold text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TrashLocationCard({
  item,
  onRestore,
  onDelete,
}: {
  item: TrashedItem;
  onRestore: (item: TrashedItem) => void;
  onDelete: (item: TrashedItem) => void;
}) {
  const locationItem = item as unknown as LocationDoc & TrashItemBase; // Temporary explicit cast for location-specific fields
  const IconComponent = locationItem.icon
    ? LOCATION_ICONS[locationItem.icon]
    : Folder;
  const kindData =
    kindConfig[locationItem.kind as keyof typeof kindConfig] || kindConfig.hard;

  return (
    <div className="group flex flex-col justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-lg dark:bg-muted/10 dark:shadow-premium hover:border-primary/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 transition-all">
          <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 -mr-2 text-muted-foreground hover:bg-muted rounded-full transition-colors outline-none cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-36 rounded-2xl p-1.5 border-border bg-card shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => onRestore(item)}
              className="rounded-xl cursor-pointer py-1.5 px-3 font-semibold hover:bg-muted text-primary"
            >
              <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border h-px my-1" />
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="rounded-xl cursor-pointer py-1.5 px-3 font-semibold text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mb-5 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-base text-foreground tracking-tight line-clamp-1">
            {item.name}
          </h3>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${kindData.className}`}
          >
            {kindData.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          Deleted:{" "}
          {item.deletedAt
            ? new Date(item.deletedAt).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>
      <div className="space-y-2 pt-3 border-t border-border/40">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Storage</span>
          <span className="font-semibold text-foreground">
            {bytesToDisplay(locationItem.usedBytes ?? 0)}{" "}
            <span className="font-normal opacity-50">/</span>{" "}
            {bytesToDisplay(locationItem.totalBytes ?? 0)}
          </span>
        </div>
        <CapacityBar
          usedBytes={locationItem.usedBytes ?? 0}
          totalBytes={locationItem.totalBytes ?? 0}
        />
      </div>
    </div>
  );
}

export function TrashLocationListRow({
  item,
  onRestore,
  onDelete,
}: {
  item: TrashedItem;
  onRestore: (item: TrashedItem) => void;
  onDelete: (item: TrashedItem) => void;
}) {
  const locationItem = item as unknown as LocationDoc & TrashItemBase;
  const IconComponent = locationItem.icon
    ? LOCATION_ICONS[locationItem.icon]
    : Folder;
  const kindData =
    kindConfig[locationItem.kind as keyof typeof kindConfig] || kindConfig.hard;

  return (
    <div className="group flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-lg dark:bg-muted/10 dark:shadow-premium hover:border-primary/50 transition-all duration-300 gap-4">
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 transition-all">
          <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-base text-foreground tracking-tight truncate">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            Deleted on{" "}
            {item.deletedAt
              ? new Date(item.deletedAt).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>
      </div>

      {/* Middle: Capacity */}
      <div className="hidden md:flex flex-col items-end w-48 shrink-0 space-y-1.5 group/storage relative">
        <span className="text-[12px] font-semibold text-muted-foreground">
          {bytesToDisplay(locationItem.usedBytes ?? 0)}{" "}
          <span className="font-normal opacity-50">/</span>{" "}
          {bytesToDisplay(locationItem.totalBytes ?? 0)}
        </span>
        <CapacityBar
          usedBytes={locationItem.usedBytes ?? 0}
          totalBytes={locationItem.totalBytes ?? 0}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${kindData.className}`}
        >
          {kindData.label}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors outline-none cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-2xl p-1.5 border-border bg-card shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => onRestore(item)}
              className="rounded-xl cursor-pointer py-2 px-3 font-semibold hover:bg-muted text-primary"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border h-px my-1 mx-1" />
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="rounded-xl cursor-pointer py-2 px-3 font-semibold text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
