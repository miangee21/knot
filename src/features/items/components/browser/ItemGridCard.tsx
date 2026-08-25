//src/features/items/components/browser/ItemGridCard.tsx
"use client";

import Link from "next/link";
import {
  Database,
  Hash,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Info,
  Folder,
} from "lucide-react";
import { ItemThumbnail } from "./ItemThumbnail";

import { bytesToDisplay } from "@/features/locations/utils/formatBytes";
import { formatRange } from "@/features/items/utils/formatRange";
import { useEditMode } from "@/shared/store/useEditMode";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface ItemGridCardProps {
  item: any;
  currentPath: string;
  allLocations: any[];
  onDetailsClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (item: any) => void;
  onMoveClick: (item: any) => void;
}

export function ItemGridCard({
  item,
  currentPath,
  allLocations,
  onDetailsClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}: ItemGridCardProps) {
  const isFolder = item.isFolder;
  const href = `${currentPath}/${item._id}`;
  const { isEditMode } = useEditMode();
  const isRiskPage = !!item.riskPath;

  const rangeString = formatRange(item.rangeStart, item.rangeEnd);

  const locationNames =
    item.locationIds && item.locationIds.length > 0
      ? item.locationIds
          .map((id: string) => allLocations.find((loc) => loc._id === id)?.name)
          .filter(Boolean)
          .join(", ")
      : "";

  const CardContent = () => (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-2.5 shadow-sm dark:bg-muted/10 dark:shadow-premium transform-gpu transition-all duration-300 ease-out active:translate-y-0",
        !isEditMode &&
          "hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg dark:hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)]",
      )}
    >
      {/* Visual Area */}
      <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/30">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-foreground/10 via-transparent to-background/5 opacity-0 transition-opacity duration-300",
            !isEditMode && "group-hover:opacity-100",
          )}
        />

        <ItemThumbnail
          posterUrl={item.posterUrl}
          isFolder={isFolder}
          className={cn(
            "h-full w-full transition-transform duration-300 ease-out",
            !isEditMode && "group-hover:scale-[1.025]",
          )}
        />

        {/* Action Dropdown Overlay (Always Visible if Edit Mode is ON) */}
        {isEditMode && (
          <div
            className="absolute top-2 right-2 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-muted transition-colors shadow-sm outline-none cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-xl border-border bg-card shadow-(--shadow-dropdown) p-1.5"
              >
                <DropdownMenuItem
                  onClick={() => onDetailsClick(item)}
                  className="rounded-lg cursor-pointer py-2 px-2.5 font-medium hover:bg-muted"
                >
                  <Info className="w-4 h-4 mr-2.5 text-muted-foreground" />{" "}
                  Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onEditClick(item)}
                  disabled={isRiskPage}
                  className="rounded-lg cursor-pointer py-2 px-2.5 font-medium hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4 mr-2.5 text-muted-foreground" />{" "}
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onMoveClick(item)}
                  disabled={isRiskPage}
                  className="rounded-lg cursor-pointer py-2 px-2.5 font-medium hover:bg-muted"
                >
                  <Folder className="w-4 h-4 mr-2.5 text-muted-foreground" />{" "}
                  Move
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border/60" />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteClick(item)}
                  disabled={isRiskPage}
                  className="rounded-lg cursor-pointer py-2 px-2.5 font-medium focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="min-w-0 px-0.5 pt-2.5 pb-0.5 flex flex-col justify-between flex-1">
        {/* Name with Custom Tooltip */}
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger className="truncate text-[13px] font-semibold leading-5 text-foreground transition-colors group-hover:text-primary outline-none cursor-default text-left">
              {item.name}
            </TooltipTrigger>
            <TooltipContent className="font-semibold text-xs max-w-xs wrap-break-word">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Metadata with TooltipProvider */}
        <TooltipProvider delay={200}>
          <div className="mt-1.5 flex min-h-4.5 items-center gap-1.5 overflow-hidden">
            {rangeString && (
              <Tooltip>
                <TooltipTrigger className="flex min-w-0 items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground outline-none">
                  <Hash className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{rangeString}</span>
                </TooltipTrigger>
                <TooltipContent className="font-medium text-xs">
                  Range: {rangeString}
                </TooltipContent>
              </Tooltip>
            )}

            {item.sizeBytes !== undefined && item.sizeBytes > 0 && (
              <Tooltip>
                <TooltipTrigger className="flex shrink-0 items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground outline-none">
                  <Database className="h-2.5 w-2.5" />
                  {bytesToDisplay(item.sizeBytes)}
                </TooltipTrigger>
                <TooltipContent className="font-medium text-xs">
                  Size: {bytesToDisplay(item.sizeBytes)}
                </TooltipContent>
              </Tooltip>
            )}

            {item.locationIds?.length > 0 && (
              <Tooltip>
                <TooltipTrigger className="flex shrink-0 items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground outline-none">
                  <MapPin className="h-2.5 w-2.5" />
                  {item.locationIds.length}
                </TooltipTrigger>
                <TooltipContent className="font-medium text-xs">
                  Locations: {locationNames}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );

  // If Folder -> Click navigates to folder
  if (isFolder) {
    return (
      <Link href={href} className="block h-full outline-none">
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="block h-full outline-none cursor-default">
      <CardContent />
    </div>
  );
}
