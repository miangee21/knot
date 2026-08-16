//src/features/locations/components/LocationListRow.tsx
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
import { LocationDoc } from "./LocationCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface LocationListRowProps {
  location: LocationDoc;
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

export function LocationListRow({
  location,
  onEdit,
  onDelete,
}: LocationListRowProps) {
  const IconComponent = iconMap[location.icon] || Folder;
  const kindData = kindConfig[location.kind];

  return (
    <div className="group flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-lg dark:bg-white/3 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 gap-4">
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
          <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-base text-foreground tracking-tight truncate">
            {location.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {location.notes || (
              <span className="italic opacity-70">No notes</span>
            )}
          </p>
        </div>
      </div>

      {/* Middle: Capacity with Tooltip */}
      <div className="hidden md:flex flex-col items-end w-48 shrink-0 space-y-1.5 group/storage relative cursor-help">
        {/* Hover Popover (Solid Background) */}
        <div className="absolute bottom-full right-0 mb-2 w-max opacity-0 pointer-events-none group-hover/storage:opacity-100 transition-opacity bg-background text-foreground text-xs font-medium py-1.5 px-3 rounded-lg shadow-2xl border border-border z-10">
          Free Space:{" "}
          <span className="text-primary font-bold">
            {location.totalBytes &&
            location.usedBytes &&
            location.totalBytes >= location.usedBytes
              ? bytesToDisplay(location.totalBytes - location.usedBytes)
              : "Unknown"}
          </span>
        </div>

        <span className="text-[12px] font-semibold text-muted-foreground">
          {bytesToDisplay(location.usedBytes)}{" "}
          <span className="font-normal opacity-50">/</span>{" "}
          {bytesToDisplay(location.totalBytes)}
        </span>
        <CapacityBar
          usedBytes={location.usedBytes}
          totalBytes={location.totalBytes}
        />
      </div>

      {/* Right: Badge & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${kindData.className}`}
        >
          {kindData.label}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors outline-none cursor-pointer border-none bg-transparent appearance-none">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-2xl p-1.5 border-border bg-card shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]"
          >
            <DropdownMenuItem
              onClick={() => onEdit(location)}
              className="rounded-xl cursor-pointer py-2 px-3 font-semibold text-foreground hover:bg-muted"
            >
              <Edit2 className="w-4 h-4 mr-2 text-foreground/70" />
              <span>Edit</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border h-px my-1 mx-1" />

            <DropdownMenuItem
              onClick={() => onDelete(location._id)}
              className="rounded-xl cursor-pointer py-2 px-3 font-semibold text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
