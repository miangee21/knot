//src/features/items/components/form/ItemFormDialog.tsx
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, ChevronsUpDown, Folder, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { RangeInput } from "./RangeInput";
import { SizeInput } from "./SizeInput";
import { LocationMultiSelect } from "./LocationMultiSelect";
import { PosterUploadField } from "./PosterUploadField";
import { Switch } from "@/shared/components/ui/switch";

import { CategoryDoc } from "@/features/categories/components/CategoryCard";
import { LocationDoc } from "@/features/locations/components/LocationCard";

import { itemFormSchema, ItemFormData } from "../../types";

function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: CategoryDoc[];
  value: string | null | undefined;
  onChange: (val: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedCat = categories.find((c) => c._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-11 rounded-xl bg-background border-border/80 hover:border-primary/50 hover:bg-background font-normal px-4"
          />
        }
      >
        <span
          className={selectedCat ? "text-foreground" : "text-muted-foreground"}
        >
          {selectedCat ? selectedCat.name : "Inherit or None"}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-64 p-0 rounded-2xl border-border bg-card shadow-(--shadow-dropdown)">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList className="custom-scrollbar">
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-xl my-1 hover:bg-muted font-medium"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-primary",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
                Inherit or None
              </CommandItem>
              {categories.map((cat) => (
                <CommandItem
                  key={cat._id}
                  onSelect={() => {
                    onChange(cat._id);
                    setOpen(false);
                  }}
                  className="cursor-pointer rounded-xl my-1 hover:bg-muted font-medium"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === cat._id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface ItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  initialData?: Partial<ItemFormData> | null;
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

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        parentId: initialData?.parentId || defaultParentId || null,
        start: initialData?.start,
        end: initialData?.end,
        sizeBytes: initialData?.sizeBytes,
        categoryId: initialData?.categoryId || null,
        locationIds: initialData?.locationIds || [],
        isFolder: initialData?.isFolder || false,
        poster: initialData?.poster || null,
        notes: initialData?.notes || "",
      });
    }
  }, [isOpen, initialData, defaultParentId, reset]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-4xl bg-card border-border/80 shadow-2xl p-6 sm:p-8">
        <DialogHeader className="mb-4 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {initialData?.name ? "Edit Item" : "Create New Item"}
          </DialogTitle>
          
          {/* Compact File/Folder Toggle */}
          <Controller
            control={control}
            name="isFolder"
            render={({ field }) => (
              <div className="flex items-center gap-2.5 bg-muted/40 px-3 py-1.5 rounded-full border border-border/80">
                <FileText className={cn("w-4 h-4 transition-colors", !field.value ? "text-primary" : "text-muted-foreground")} />
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                  className="scale-90"
                />
                <Folder className={cn("w-4 h-4 transition-colors", field.value ? "text-primary fill-primary/20" : "text-muted-foreground")} />
              </div>
            )}
          />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    Size (Optional)
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

            <div className="md:col-span-5 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Poster
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
                  Notes
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
              disabled={isLoading}
              className="rounded-full px-8 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-px"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
