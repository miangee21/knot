//src/features/categories/components/CategoryFormDialog.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Tag } from "lucide-react";
import { CategoryFormData, categorySchema } from "../types";
import { IconPicker } from "./IconPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { CategoryDoc } from "./CategoryCard";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: CategoryDoc | null;
  isLoading?: boolean;
}

export function CategoryFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CategoryFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "Tag", // Default icon
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentIcon = watch("icon");

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          icon: initialData.icon,
        });
      } else {
        reset({
          name: "",
          icon: "Tag",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-4xl bg-card border-border/50 shadow-2xl p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            {initialData ? "Edit Category" : "New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Cables, Documents, Cameras"
              className="w-full bg-background/50 ring-1 ring-border/50 focus:ring-2 focus:ring-primary/60 h-12 rounded-full px-4 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/50"
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1.5 ml-3 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Icon Picker Component */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
              Select Icon
            </label>
            <IconPicker
              value={currentIcon}
              onChange={(icon) => setValue("icon", icon)}
              disabled={isLoading}
            />
            {errors.icon && (
              <p className="text-destructive text-xs mt-1.5 ml-3 font-medium">
                {errors.icon.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 mt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-full font-semibold border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:-translate-y-px transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
