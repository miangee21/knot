//src/features/trash/components/TrashModals.tsx
"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ItemDoc, CategoryDoc, LocationDoc } from "@/features/items/types";

type TrashType = "item" | "category" | "location";
type TrashedItem = (ItemDoc | CategoryDoc | LocationDoc) & {
  type: TrashType;
  name: string;
  _id: string;
};

interface TrashModalsProps {
  itemToDelete: TrashedItem | null;
  setItemToDelete: (val: TrashedItem | null) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
  itemToRestore: TrashedItem | null;
  setItemToRestore: (val: TrashedItem | null) => void;
  onConfirmRestore: () => Promise<void>;
  isRestoring: boolean;
  isEmptyBinOpen: boolean;
  setIsEmptyBinOpen: (val: boolean) => void;
  onConfirmEmptyBin: () => Promise<void>;
  isEmptying: boolean;
}

export function TrashModals({
  itemToDelete,
  setItemToDelete,
  onConfirmDelete,
  isDeleting,
  itemToRestore,
  setItemToRestore,
  onConfirmRestore,
  isRestoring,
  isEmptyBinOpen,
  setIsEmptyBinOpen,
  onConfirmEmptyBin,
  isEmptying,
}: TrashModalsProps) {
  return (
    <>
      {/* Permanent Delete Modal */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Permanently Delete?"
        description={`Are you sure you want to permanently delete "${itemToDelete?.name}"? This action cannot be undone and files will be wiped from storage.`}
      />

      {/* Custom Restore Modal (Fixed Button Text/Color) */}
      <Dialog
        open={!!itemToRestore}
        onOpenChange={(open) => !isRestoring && !open && setItemToRestore(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Restore Item
            </DialogTitle>
            <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to restore &quot;{itemToRestore?.name}
              &quot;? It will be moved back to its original location.
            </div>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setItemToRestore(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmRestore}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              Restore
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty Bin Modal */}
      <ConfirmDialog
        isOpen={isEmptyBinOpen}
        onClose={() => !isEmptying && setIsEmptyBinOpen(false)}
        onConfirm={onConfirmEmptyBin}
        title="Empty Recycle Bin?"
        description="Are you sure you want to permanently delete ALL items, categories, and locations in the recycle bin? This action cannot be undone."
      />
    </>
  );
}
