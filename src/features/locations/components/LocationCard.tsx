//src/features/locations/components/LocationCard.tsx
"use client";

import * as React from "react";
import {
  MoreVertical,
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
  Edit2,
  Trash2,
  Folder,
} from "lucide-react";
import { CapacityBar } from "./CapacityBar";
import { bytesToDisplay } from "../utils/formatBytes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export interface LocationDoc {
  _id: string;
  name: string;
  kind: "hard" | "os" | "cloud" | "mobile";
  icon: string;
  totalBytes?: number;
  usedBytes?: number;
  notes?: string;
}

interface LocationCardProps {
  location: LocationDoc;
  itemCount: number;
  onEdit: (location: LocationDoc) => void;
  onDelete: (id: string) => void;
}

const kindConfig = {
  hard: { label: "Hard Drive", className: "text-kind-hard bg-kind-hard/10" },
  cloud: { label: "Cloud", className: "text-kind-cloud bg-kind-cloud/10" },
  mobile: { label: "Mobile", className: "text-kind-mobile bg-kind-mobile/10" },
  os: { label: "OS Drive", className: "text-kind-os bg-kind-os/10" },
};

const iconMap: Record<string, React.ElementType> = {
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
  Folder,
};

export function LocationCard({
  location,
  itemCount,
  onEdit,
  onDelete,
}: LocationCardProps) {
  const IconComponent = iconMap[location.icon] || Folder;
  const kindData = kindConfig[location.kind];

  // Calculate Free Space
  const freeBytes =
    location.totalBytes !== undefined &&
    location.usedBytes !== undefined &&
    location.totalBytes >= location.usedBytes
      ? location.totalBytes - location.usedBytes
      : 0;
  const freeSpaceText =
    location.totalBytes !== undefined ? bytesToDisplay(freeBytes) : "Unknown";

  return (
    <div className="group flex flex-col justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-lg dark:bg-muted/10 dark:shadow-premium hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
          <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors outline-none cursor-pointer border-none bg-transparent appearance-none">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-36 rounded-2xl p-1.5 border-border bg-card shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => onEdit(location)}
              className="rounded-xl cursor-pointer py-1.5 px-3 text-sm font-medium hover:bg-muted"
            >
              <Edit2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border h-px my-1" />
            <DropdownMenuItem
              onClick={() => onDelete(location._id)}
              className="rounded-xl cursor-pointer py-1.5 px-3 text-sm font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-5 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-base text-foreground tracking-tight line-clamp-1">
            {location.name}
          </h3>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${kindData.className}`}
          >
            {kindData.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          <span className="font-semibold text-primary">
            {itemCount} {itemCount === 1 ? "Item" : "Items"}
          </span>{" "}
          • {location.notes || "No notes"}
        </p>
      </div>

      {/* Storage Section with Hover Tooltip */}
      <div className="group/storage relative space-y-2 pt-3 border-t border-border/40 cursor-help">
        {/* Hover Popover (Solid Background) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 pointer-events-none group-hover/storage:opacity-100 transition-opacity bg-background text-foreground text-xs font-medium py-1.5 px-3 rounded-lg shadow-2xl border border-border z-10">
          Free Space:{" "}
          <span className="text-primary font-bold">{freeSpaceText}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Storage</span>
          <span className="font-semibold text-foreground">
            {bytesToDisplay(location.usedBytes)}{" "}
            <span className="font-normal opacity-50">/</span>{" "}
            {bytesToDisplay(location.totalBytes)}
          </span>
        </div>
        <CapacityBar
          usedBytes={location.usedBytes}
          totalBytes={location.totalBytes}
        />
      </div>
    </div>
  );
}
