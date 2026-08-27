//src/features/items/components/detail/ItemDetailSheet.tsx
"use client";

import { Database, Hash, MapPin, Tag, FileText, Folder } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { ItemThumbnail } from "../browser/ItemThumbnail";
import { InfoCard } from "./InfoCard";
import { ItemPathField } from "./ItemPathField";
import { bytesToDisplay } from "@/features/locations/utils/formatBytes";
import { formatRange } from "@/features/items/utils/formatRange";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ItemDoc, LocationDoc, CategoryDoc } from "../../types";
import { Id } from "../../../../../convex/_generated/dataModel";

interface ItemDetailSheetProps {
  item: ItemDoc | null;
  isOpen: boolean;
  onClose: () => void;
  allLocations: LocationDoc[];
  categories: CategoryDoc[];
  ancestors?: ItemDoc[];
}

export function ItemDetailSheet({
  item,
  isOpen,
  onClose,
  allLocations,
  categories,
  ancestors = [],
}: ItemDetailSheetProps) {
  // HOOKS HAMESHA EARLY RETURN SE PEHLE!
  const isFolder = item?.isFolder || false;
  const itemId = item?._id;

  const folderCounts = useQuery(
    api.items.getFolderCounts,
    isFolder && itemId ? { parentId: itemId as Id<"items"> } : "skip",
  );

  if (!item) return null;

  const subtitle = item.isFolder
    ? folderCounts
      ? `${folderCounts.folders} Folders, ${folderCounts.files} Files`
      : "Calculating..."
    : "1 File";

  const catName =
    categories.find((c) => c._id === item.categoryId)?.name || "Uncategorized";

  const locations =
    item.locationIds
      ?.map((id: string) =>
        allLocations.find((location) => location._id === id),
      )
      .filter(Boolean) || [];

  const rangeStr = formatRange(item.rangeStart, item.rangeEnd);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetTitle className="sr-only">Item Details</SheetTitle>

      <SheetContent
        side="right"
        className="
          flex h-dvh w-full flex-col gap-0 overflow-hidden
          border-l border-border bg-background p-0
          shadow-2xl sm:max-w-107.5
        "
      >
        {/* ================= HEADER ================= */}
        <div className="relative shrink-0 border-b border-border/70">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative px-6 pb-5 pt-7">
            <div className="flex items-center gap-4">
              <div
                className="
                  h-19.5 w-16 shrink-0 overflow-hidden rounded-2xl
                  border border-border bg-muted shadow-sm
                "
              >
                <ItemThumbnail
                  posterUrl={item.posterUrl}
                  isFolder={item.isFolder}
                  className="h-full w-full object-cover"
                  iconClassName="h-7 w-7"
                />
              </div>

              <div className="min-w-0 flex-1 pr-5">
                <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                  {item.isFolder ? (
                    <Folder className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  {item.isFolder ? "Folder" : "File"}
                </div>

                <h2
                  className="truncate text-[18px] font-bold leading-tight tracking-tight text-foreground"
                  title={item.name}
                >
                  {item.name}
                </h2>

                <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
          {/* Overview Section */}
          <div className="shrink-0">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Overview
              </span>
            </div>

            <ItemPathField ancestors={ancestors} itemName={item.name} />

            <div className="grid grid-cols-2 gap-2">
              <InfoCard icon={Tag} label="Category" value={catName} prominent />
              <InfoCard
                icon={Database}
                label="Size"
                value={bytesToDisplay(item.sizeBytes)}
              />
              <InfoCard
                icon={Hash}
                label="Range"
                value={rangeStr || "Not specified"}
              />
              <InfoCard
                icon={MapPin}
                label="Locations"
                value={
                  locations.length
                    ? `${locations.length} ${
                        locations.length === 1 ? "location" : "locations"
                      }`
                    : "None"
                }
              />
            </div>
          </div>

          {/* ================= LOCATIONS ================= */}
          <div className="mt-3.5 shrink-0">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Storage Locations
              </span>
            </div>

            <div
              className="
                flex min-h-9.5 flex-wrap items-center gap-1.5
                rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2
              "
            >
              {locations.length > 0 ? (
                locations.map((location: any) => (
                  <div
                    key={location._id}
                    className="
                      inline-flex max-w-full items-center gap-1.5
                      rounded-lg border border-border/60
                      bg-background px-2.5 py-1.5
                      text-[10px] font-semibold text-foreground
                    "
                    title={location.name}
                  >
                    <MapPin className="h-3 w-3 shrink-0 text-primary" />
                    <span className="max-w-30 truncate">{location.name}</span>
                  </div>
                ))
              ) : (
                <span className="px-1 text-[10px] font-medium text-muted-foreground">
                  No location assigned
                </span>
              )}
            </div>
          </div>

          {/* ================= NOTES ================= */}
          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <div className="mb-2 flex shrink-0 items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Notes
              </span>
            </div>

            <div
              className="
                min-h-0 flex-1 overflow-hidden rounded-2xl
                border border-border/70 bg-muted/30
                px-4 py-3.5
              "
            >
              {item.notes ? (
                <p className="line-clamp-12 whitespace-pre-wrap text-[12px] leading-[1.65] text-foreground/80 custom-scrollbar overflow-y-auto h-full pr-2">
                  {item.notes}
                </p>
              ) : (
                <div className="flex h-full min-h-22.5 flex-col items-center justify-center text-center">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-background text-muted-foreground/50 ring-1 ring-border">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    No notes added
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                    Nothing has been added to this item yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
