//src/features/categories/hooks/useCategories.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CategoryFormData } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useCategories() {
  const categories = useQuery(api.categories.getCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);

  const isLoading = categories === undefined;

  const handleCreate = async (data: CategoryFormData) => {
    try {
      await createCategory(data);
      toast.success("Category created successfully!");
    } catch (error) {
      toast.error("Failed to create category.");
      throw error;
    }
  };

  const handleUpdate = async (id: string, data: CategoryFormData) => {
    try {
      await updateCategory({ id: id as Id<"categories">, ...data });
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error("Failed to update category.");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory({ id: id as Id<"categories"> });
      toast.success("Category deleted.");
    } catch (error) {
      toast.error("Failed to delete category.");
      throw error;
    }
  };

  return {
    categories,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
