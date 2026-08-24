//src/features/items/components/browser/BrowseModals.tsx
"use client";

import { ItemFormDialog } from "@/features/items/components/form/ItemFormDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { MoveItemDialog } from "@/features/items/components/browser/MoveItemDialog";
import { ItemDetailSheet } from "@/features/items/components/detail/ItemDetailSheet";
import { ItemFormData } from "@/features/items/types";
import { Id } from "../../../../../convex/_generated/dataModel";

interface BrowseModalsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  onFormSubmit: (data: ItemFormData) => Promise<void>;
  editingItem: any;
  currentParentId: Id<"items"> | null;
  categories: any[];
  locations: any[];
  inheritedLocationIds: string[];
  isSubmitting: boolean;
  itemToDelete: any;
  setItemToDelete: (item: any) => void;
  onConfirmDelete: () => Promise<void>;
  movingItem: any;
  setMovingItem: (item: any) => void;
  detailItem: any;
  setDetailItem: (item: any) => void;
  ancestors: any[] | undefined;
}

export function BrowseModals({
  isFormOpen,
  setIsFormOpen,
  onFormSubmit,
  editingItem,
  currentParentId,
  categories,
  locations,
  inheritedLocationIds,
  isSubmitting,
  itemToDelete,
  setItemToDelete,
  onConfirmDelete,
  movingItem,
  setMovingItem,
  detailItem,
  setDetailItem,
  ancestors,
}: BrowseModalsProps) {
  return (
    <>
      <ItemFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onFormSubmit}
        initialData={editingItem}
        defaultParentId={currentParentId || undefined}
        categories={categories}
        locations={locations}
        inheritedLocationIds={inheritedLocationIds}
        isLoading={isSubmitting}
      />
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Delete Item"
        description="Are you sure you want to move this item to the Recycle Bin? If this is a folder, all items inside it will also be moved to the bin."
      />
      <MoveItemDialog
        item={movingItem}
        isOpen={!!movingItem}
        onClose={() => setMovingItem(null)}
      />
      <ItemDetailSheet
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        allLocations={locations}
        categories={categories}
        ancestors={ancestors}
      />
    </>
  );
}
