//src/features/items/components/form/ItemFormDialog.tsx
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ItemTypeToggle } from "./ItemTypeToggle";
import { RangeInput } from "./RangeInput";
import { SizeInput } from "./SizeInput";
import { LocationMultiSelect } from "./LocationMultiSelect";
import { PosterUploadField } from "./PosterUploadField";
import { CategorySelect } from "./CategorySelect";
import { CategoryDoc } from "@/features/categories/components/CategoryCard";
import { LocationDoc } from "@/features/locations/components/LocationCard";
import { itemFormSchema, ItemFormData, ItemDoc } from "../../types";

interface ItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  initialData?: Partial<ItemDoc> | null;
  defaultParentId?: string;
  categories: CategoryDoc[];
  locations: LocationDoc[];
  inheritedLocationIds?: string[];
  isLoading?: boolean;
}

export function ItemFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultParentId,
  categories,
  locations,
  inheritedLocationIds = [],
  isLoading,
}: ItemFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      parentId: defaultParentId || null,
      locationIds: [],
      isFolder: false,
      notes: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchName = watch("name");
  const watchSize = watch("sizeBytes");
  const watchLocations = watch("locationIds");
  const effectiveLocations = Array.from(
    new Set([...(watchLocations || []), ...(inheritedLocationIds || [])]),
  );
  const isFormValid =
    !!watchName &&
    watchSize !== undefined &&
    watchSize !== null &&
    effectiveLocations.length > 0;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        parentId: initialData?.parentId || defaultParentId || null,
        start: initialData?.rangeStart ?? undefined,
        end: initialData?.rangeEnd ?? undefined,
        sizeBytes: initialData?.sizeBytes,
        categoryId: initialData?.categoryId || null,
        locationIds: initialData
          ? initialData.locationIds || []
          : inheritedLocationIds || [],
        isFolder: initialData?.isFolder || false,
        poster: initialData?.posterUrl || null,
        notes: initialData?.notes || "",
      });
    }
  }, [isOpen, initialData, defaultParentId, reset, inheritedLocationIds]);
  const isEditing = !!initialData?._id || !!initialData?.name;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-4xl bg-card border-border/80 shadow-2xl p-6 sm:p-8">
        <DialogHeader className="mb-4 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Item" : "Create New Item"}
          </DialogTitle>

          <Controller
            control={control}
            name="isFolder"
            render={({ field }) => (
              <ItemTypeToggle value={field.value} onChange={field.onChange} />
            )}
          />
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            (data) => {
              const mergedLocations = Array.from(
                new Set([
                  ...(data.locationIds || []),
                  ...(inheritedLocationIds || []),
                ]),
              );
              onSubmit({ ...data, locationIds: mergedLocations });
            },
            (errors) => {
              if (errors.poster?.message) {
                toast.error(errors.poster.message as string);
              } else {
                toast.error("Please fill in all required fields correctly.");
              }
            },
          )}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. Breaking Bad Season 1"
                  className="w-full h-11 bg-background border border-border/80 rounded-xl px-4 text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <Controller
                control={control}
                name="start"
                render={({ field: startField }) => (
                  <Controller
                    control={control}
                    name="end"
                    render={({ field: endField }) => (
                      <RangeInput
                        startValue={startField.value || undefined}
                        endValue={endField.value || undefined}
                        onChange={(s, e) => {
                          startField.onChange(s);
                          endField.onChange(e);
                        }}
                      />
                    )}
                  />
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Size <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="sizeBytes"
                    render={({ field }) => (
                      <SizeInput
                        valueBytes={field.value || undefined}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Category (Optional)
                  </label>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <CategorySelect
                        categories={categories}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Locations <span className="text-destructive">*</span>
                </label>
                <Controller
                  control={control}
                  name="locationIds"
                  render={({ field }) => (
                    <LocationMultiSelect
                      allLocations={locations}
                      selectedIds={field.value}
                      onChange={field.onChange}
                      inheritedIds={inheritedLocationIds}
                    />
                  )}
                />
              </div>
            </div>
            <div className="md:col-span-5 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Poster (Optional)
                </label>
                <Controller
                  control={control}
                  name="poster"
                  render={({ field }) => (
                    <PosterUploadField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-sm font-semibold text-foreground">
                  Notes (Optional)
                </label>
                <textarea
                  {...register("notes")}
                  placeholder="Any extra details..."
                  className="w-full flex-1 min-h-25 bg-background border border-border/80 rounded-xl p-4 text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none custom-scrollbar"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-full px-6 h-11 font-semibold border-border/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="rounded-full px-8 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-px"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
