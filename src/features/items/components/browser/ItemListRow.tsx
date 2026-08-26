//src/features/items/components/browser/ItemListRow.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ItemThumbnail } from "./ItemThumbnail";

import { formatRange } from "@/features/items/utils/formatRange";
import { useEditMode } from "@/shared/store/useEditMode";
import { cn } from "@/shared/lib/utils";

import { ItemListRowActions } from "./ItemListRowActions";
import {
  NameCell,
  RangeCell,
  SizeCell,
  LocationsCell,
} from "./ItemListRowCells";

interface ItemListRowProps {
  item: any;
  currentPath: string;
  allLocations: any[];
  columnWidths: {
    name: number;
    range: number;
    size: number;
    locations: number;
  };
  onResizeStart: (
    column: "name" | "range" | "size" | "locations",
    startX: number,
    containerWidth: number,
  ) => void;
  onDetailsClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (item: any) => void;
  onMoveClick: (item: any) => void;
}

export function ItemListRow({
  item,
  currentPath,
  allLocations,
  columnWidths,
  onResizeStart,
  onDetailsClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}: ItemListRowProps) {
  const isFolder = item.isFolder;
  const href = `${currentPath}/${item._id}`;
  const { isEditMode } = useEditMode();

  const rangeString = formatRange(item.rangeStart, item.rangeEnd);

  const locationNames =
    item.locationIds && item.locationIds.length > 0
      ? item.locationIds
          .map((id: string) => allLocations.find((loc) => loc._id === id)?.name)
          .filter(Boolean)
          .join(", ")
      : "";

  const RowContent = () => (
    <div
      data-resizable-row
      className={cn(
        "group relative grid w-full items-stretch",
        "grid-cols-[auto_minmax(0,var(--name-width))_minmax(0,var(--range-width))_minmax(0,var(--size-width))_minmax(0,var(--locations-width))_auto]",
        "gap-3 sm:gap-4 rounded-2xl border border-border/80 bg-card px-3 py-2.5 sm:px-4 sm:py-3",
        "shadow-sm dark:bg-muted/10 dark:shadow-premium transform-gpu transition-all duration-300 ease-out",
        !isEditMode &&
          "hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg dark:hover:shadow-float",
      )}
      style={
        {
          "--name-width": `${columnWidths.name}fr`,
          "--range-width": `${columnWidths.range}fr`,
          "--size-width": `${columnWidths.size}fr`,
          "--locations-width": `${columnWidths.locations}fr`,
        } as React.CSSProperties
      }
    >
      {/* Subtle left hover accent */}
      <div className="pointer-events-none absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Thumbnail */}
      <div className="relative h-12 w-10 shrink-0 self-center overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/40">
        <ItemThumbnail
          posterUrl={item.posterUrl}
          isFolder={isFolder}
          variant="list"
          className="h-full w-full"
          iconClassName="h-5 w-5"
        />
      </div>

      <NameCell
        item={item}
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
      <RangeCell
        rangeString={rangeString}
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
      <SizeCell
        item={item}
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />
      <LocationsCell
        item={item}
        locationNames={locationNames}
        isEditMode={isEditMode}
        onResizeStart={onResizeStart}
      />

      <ItemListRowActions
        item={item}
        isEditMode={isEditMode}
        onDetailsClick={onDetailsClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onMoveClick={onMoveClick}
      />
    </div>
  );

  if (isFolder) {
    return (
      <Link href={href} className="block h-full outline-none">
        <RowContent />
      </Link>
    );
  }

  return (
    <div className="block h-full cursor-default outline-none">
      <RowContent />
    </div>
  );
}
