//src/features/locations/components/LocationDeleteModals.tsx
"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

interface LocationDeleteModalsProps {
  locationToDelete: string | null;
  setLocationToDelete: (id: string | null) => void;
  locationCounts: Record<string, number>;
  handleDelete: (id: string) => Promise<void>;
}

export function LocationDeleteModals({
  locationToDelete,
  setLocationToDelete,
  locationCounts,
  handleDelete,
}: LocationDeleteModalsProps) {
  const router = useRouter();

  const count = locationToDelete ? locationCounts[locationToDelete] || 0 : 0;
  const hasItems = count > 0;

  return (
    <>
      {/* Blocked Delete Dialog (If Items Exist) */}
      <Dialog
        open={!!locationToDelete && hasItems}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" /> Cannot Delete
              Location
            </DialogTitle>
            <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
              This location cannot be deleted because it is currently linked to{" "}
              <span className="font-bold text-foreground">{count} item(s)</span>
              . You must reassign or delete these items before removing this
              location.
            </div>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setLocationToDelete(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (locationToDelete) {
                  router.push(`/browse?locationFilterId=${locationToDelete}`);
                }
              }}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              View Linked Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Standard Delete Dialog (Move to Bin - If Empty) */}
      <ConfirmDialog
        isOpen={!!locationToDelete && !hasItems}
        onClose={() => setLocationToDelete(null)}
        onConfirm={async () => {
          if (locationToDelete) {
            try {
              await handleDelete(locationToDelete);
            } catch {
              // Error handled by hook toast
            } finally {
              setLocationToDelete(null);
            }
          }
        }}
        title="Delete Location"
        description="Are you sure you want to move this location to the Recycle Bin?"
      />
    </>
  );
}
