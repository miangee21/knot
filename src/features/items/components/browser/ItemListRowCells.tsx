//src/features/items/components/browser/ItemListRowCells.tsx
"use client";

import { Database, Hash, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { ItemDoc } from "../../types";
import { bytesToDisplay } from "@/features/locations/utils/formatBytes";

// Smart Resizer Component
function ColumnResizer({
  column,
  isEditMode,
  onResizeStart,
}: {
  column: "name" | "range" | "size" | "locations";
  isEditMode: boolean;
  onResizeStart: any;
}) {
  if (!isEditMode) return null;

  return (
    <div
      className="group/resizer absolute -right-2 top-0 z-30 flex h-full w-4 cursor-col-resize items-center justify-center"
      onMouseDown={(e) => {
        e.preventDefault();
        const row = e.currentTarget.closest("[data-resizable-row]");
        if (!row) return;
        onResizeStart(column, e.clientX, row.getBoundingClientRect().width);
      }}
    >
      <div
        className="
          h-1/2 w-[1.5px] rounded-full bg-primary/30 opacity-0 
          transition-all duration-200 ease-out 
          group-hover:opacity-100 
          group-hover/resizer:h-[70%] group-hover/resizer:w-[2.5px] group-hover/resizer:bg-primary
        "
      />
    </div>
  );
}

export function NameCell({
  item,
  isEditMode,
  onResizeStart,
}: {
  item: ItemDoc;
  isEditMode: boolean;
  onResizeStart: any;
}) {
  return (
    <div className="relative flex h-full min-w-0 items-center pr-2">
      <div className="flex min-w-0 items-center gap-2">
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger className="min-w-0 cursor-default truncate text-left text-[13px] font-semibold leading-5 text-foreground outline-none transition-colors duration-200 group-hover:text-primary">
              {item.name}
            </TooltipTrigger>
            <TooltipContent className="max-w-xs wrap-break-word text-xs font-semibold">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {item.isFolder && (
          <span className="hidden shrink-0 rounded-md border border-primary/10 bg-primary/6 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary/70 sm:inline-flex">
            Folder
          </span>
        )}
      </div>
      <ColumnResizer
        column="name"
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
    </div>
  );
}

export function RangeCell({
  rangeString,
  isEditMode,
  onResizeStart,
}: {
  rangeString: string;
  isEditMode: boolean;
  onResizeStart: any;
}) {
  return (
    <div className="relative flex h-full min-w-0 items-center pr-2">
      {rangeString ? (
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-muted/70 px-2 py-1 text-[10px] font-medium text-muted-foreground outline-none">
              <Hash className="h-3 w-3 shrink-0" />
              <span className="truncate">{rangeString}</span>
            </TooltipTrigger>
            <TooltipContent className="text-xs font-medium">
              Range: {rangeString}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      <ColumnResizer
        column="range"
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
    </div>
  );
}

export function SizeCell({
  item,
  isEditMode,
  onResizeStart,
}: {
  item: ItemDoc;
  isEditMode: boolean;
  onResizeStart: any;
}) {
  return (
    <div className="relative flex h-full min-w-0 items-center pr-2">
      {item.sizeBytes !== undefined && item.sizeBytes > 0 ? (
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2 py-1 text-[10px] font-medium text-muted-foreground outline-none">
              <Database className="h-3 w-3 shrink-0" />
              {bytesToDisplay(item.sizeBytes)}
            </TooltipTrigger>
            <TooltipContent className="text-xs font-medium">
              Size: {bytesToDisplay(item.sizeBytes)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      <ColumnResizer
        column="size"
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
    </div>
  );
}

export function LocationsCell({
  item,
  locationNames,
  isEditMode,
  onResizeStart,
}: {
  item: ItemDoc;
  locationNames: string;
  isEditMode: boolean;
  onResizeStart: any;
}) {
  return (
    <div className="relative flex h-full min-w-0 items-center pr-2">
      {item.locationIds?.length > 0 ? (
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2 py-1 text-[10px] font-medium text-muted-foreground outline-none">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.locationIds.length}
              <span className="hidden lg:inline">Locations</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs font-medium">
              Locations: {locationNames}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      <ColumnResizer
        column="locations"
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
    </div>
  );
}
