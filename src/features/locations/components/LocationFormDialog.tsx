//src/features/locations/components/LocationFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  HardDrive,
  Cloud,
  Smartphone,
  Monitor,
  Folder,
} from "lucide-react";
import { LocationFormData, locationSchema } from "../types";
import { LocationDoc } from "./LocationCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface LocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LocationFormData) => Promise<void>;
  initialData?: LocationDoc | null;
  isLoading?: boolean;
}

const iconOptions = [
  { name: "HardDrive", icon: HardDrive },
  { name: "Cloud", icon: Cloud },
  { name: "Smartphone", icon: Smartphone },
  { name: "Monitor", icon: Monitor },
  { name: "Folder", icon: Folder },
];

const GB_TO_BYTES = 1024 * 1024 * 1024;

export function LocationFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: LocationFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "", kind: "hard", icon: "HardDrive", notes: "" },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentIcon = watch("icon");
  const currentKind = watch("kind");
  const watchTotal = watch("totalBytes") ?? 0;
  const watchUsed = watch("usedBytes") ?? 0;

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          kind: initialData.kind,
          icon: initialData.icon,
          totalBytes: initialData.totalBytes
            ? initialData.totalBytes / GB_TO_BYTES
            : undefined,
          usedBytes: initialData.usedBytes
            ? initialData.usedBytes / GB_TO_BYTES
            : undefined,
          notes: initialData.notes || "",
        });
      } else {
        reset({ name: "", kind: "hard", icon: "HardDrive", notes: "" });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: LocationFormData) => {
    const formattedData = {
      ...data,
      totalBytes:
        data.totalBytes !== undefined
          ? data.totalBytes * GB_TO_BYTES
          : undefined,
      usedBytes:
        data.usedBytes !== undefined ? data.usedBytes * GB_TO_BYTES : undefined,
    };
    await onSubmit(formattedData);
    onClose();
  };

  const freeSpace =
    watchTotal >= watchUsed ? (watchTotal - watchUsed).toFixed(1) : "0";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* horizontal layout */}
      <DialogContent className="sm:max-w-3xl rounded-4xl bg-card border-border/50 shadow-2xl p-6 sm:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-primary" />
            </div>
            {initialData ? "Edit Location" : "New Location"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                  Location Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSD 1TB"
                  className="w-full bg-background/50 ring-1 ring-border/50 focus:ring-2 focus:ring-primary/60 h-12 rounded-full px-4 text-sm font-medium outline-none"
                  disabled={isLoading}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1.5 ml-3 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                  Storage Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["hard", "os", "cloud", "mobile"] as const).map((kind) => (
                    <div
                      key={kind}
                      onClick={() => !isLoading && setValue("kind", kind)}
                      className={`flex items-center justify-center h-10 rounded-2xl text-xs font-bold uppercase cursor-pointer border ${currentKind === kind ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border/50 text-muted-foreground hover:bg-muted"}`}
                    >
                      {kind}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                  Icon
                </label>
                <div className="flex gap-2">
                  {iconOptions.map((opt) => (
                    <div
                      key={opt.name}
                      onClick={() => !isLoading && setValue("icon", opt.name)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer border ${currentIcon === opt.name ? "bg-primary/10 border-primary text-primary" : "bg-background border-border/50 text-muted-foreground"}`}
                    >
                      <opt.icon className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                    Total (GB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 500"
                    className="w-full bg-background/50 ring-1 ring-border/50 focus:ring-2 focus:ring-primary/60 h-12 rounded-full px-4 text-sm font-medium outline-none"
                    disabled={isLoading}
                    {...register("totalBytes", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                    Used (GB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 250"
                    className="w-full bg-background/50 ring-1 ring-border/50 focus:ring-2 focus:ring-primary/60 h-12 rounded-full px-4 text-sm font-medium outline-none"
                    disabled={isLoading}
                    {...register("usedBytes", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground px-2">
                Calculated Free Space:{" "}
                <span className="text-primary">{freeSpace} GB</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Any details..."
                  className="w-full bg-background/50 ring-1 ring-border/50 focus:ring-2 focus:ring-primary/60 rounded-3xl p-4 text-sm font-medium outline-none resize-none h-24"
                  disabled={isLoading}
                  {...register("notes")}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-full font-semibold border-border/60"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
