//src/features/items/components/browser/MoveItemDialog.tsx
"use client";

import * as React from "react";
import { Folder, ChevronRight, Loader2, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUpdateItem } from "../../hooks/useUpdateItem";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ItemDoc } from "../../types";

interface MoveItemDialogProps {
  item: ItemDoc | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MoveItemDialog({ item, isOpen, onClose }: MoveItemDialogProps) {
  const [currentFolderId, setCurrentFolderId] =
    React.useState<Id<"items"> | null>(null);
  const [isMoving, setIsMoving] = React.useState(false);
  const { handleUpdate } = useUpdateItem();

  // Reset to root when opened
  React.useEffect(() => {
    if (isOpen && item) {
      // Start at root by default safely without synchronous cascades
      queueMicrotask(() => setCurrentFolderId(null));
    }
  }, [isOpen, item]);

  // Fetch folders for the current view (Paginated limit for Dialog)
  const childrenResponse = useQuery(
    api.items.getChildren,
    isOpen
      ? {
          parentId: currentFolderId,
          paginationOpts: { numItems: 100, cursor: null },
        }
      : "skip",
  );

  // Fetch ancestors for breadcrumb
  const ancestors = useQuery(
    api.items.getAncestors,
    currentFolderId ? { itemId: currentFolderId } : "skip",
  );

  const folders =
    childrenResponse?.page?.filter(
      (c): c is ItemDoc => c !== null && c.isFolder,
    ) || [];

  // SECURITY: Check if current destination is the item itself or inside it
  const isDescendant = ancestors?.some((anc: ItemDoc) => anc._id === item?._id);
  const isSelf = currentFolderId === item?._id;
  const isCurrentParent = currentFolderId === item?.parentId;
  const isInvalidDestination = isSelf || isDescendant || isCurrentParent;

  const handleMove = async () => {
    if (!item) return;

    // Prevent moving a folder into itself or its children
    if (item.isFolder && (isSelf || isDescendant)) {
      toast.error("You cannot move a folder into itself or its subfolders!");
      return;
    }

    setIsMoving(true);
    try {
      // Pass all required existing fields along with the NEW parentId
      await handleUpdate(item._id as Id<"items">, {
        name: item.name,
        sizeBytes: item.sizeBytes,
        locationIds: item.locationIds || [],
        categoryId: item.categoryId ?? null,
        isFolder: item.isFolder ?? false,
        start: item.rangeStart ?? null,
        end: item.rangeEnd ?? null,
        posterStorageId: item.posterStorageId ?? undefined,
        notes: item.notes ?? null,
        parentId: currentFolderId,
      });

      toast.success("Moved successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to move item.");
      console.error(error);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isMoving && onClose()}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border/80 rounded-3xl shadow-2xl">
        <DialogHeader className="p-5 pb-4 border-b border-border/50">
          <DialogTitle className="text-lg font-bold text-foreground">
            Move Item
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            Moving{" "}
            <span className="font-semibold text-foreground">{item?.name}</span>
          </p>
        </DialogHeader>

        {/* Mini File Explorer Breadcrumb */}
        <div className="flex items-center gap-1.5 px-5 py-3 bg-muted/30 border-b border-border/50 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`flex items-center justify-center p-1.5 rounded-md hover:bg-muted transition-colors ${!currentFolderId ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="w-4 h-4" />
          </button>

          {ancestors?.map((anc: ItemDoc) => (
            <React.Fragment key={anc._id}>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
              <button
                onClick={() => setCurrentFolderId(anc._id as Id<"items">)}
                className={`text-xs font-semibold px-2 py-1 rounded-md hover:bg-muted transition-colors whitespace-nowrap ${currentFolderId === anc._id ? "text-primary" : "text-foreground/80"}`}
              >
                {anc.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Folders List */}
        <div className="h-64 overflow-y-auto custom-scrollbar p-2">
          {childrenResponse === undefined ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Folder className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-medium text-muted-foreground">
                This folder is empty
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => setCurrentFolderId(folder._id as Id<"items">)}
                  disabled={folder._id === item?._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder
                      className={`w-5 h-5 shrink-0 ${folder._id === item?._id ? "text-muted-foreground/50" : "text-primary/70"}`}
                    />
                    <span className="text-sm font-semibold truncate text-foreground/90">
                      {folder.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground/60 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isMoving}
            className="rounded-full h-10 px-5 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isMoving || isInvalidDestination}
            className="rounded-full h-10 px-6 font-bold shadow-md bg-primary hover:bg-primary/90"
          >
            {isMoving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Move Here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
