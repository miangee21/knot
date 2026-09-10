//src/features/categories/hooks/useCategories.ts
"use client";

import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CategoryFormData } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// 1. Hook for Dropdowns (Flat List)
export function useCategories() {
  const categories = useQuery(api.categories.getCategories);
  return { categories, isLoading: categories === undefined };
}

// 2. Hook for Categories Page (Paginated)
export function usePaginatedCategories(itemsPerPage: number = 10) {
  const storageKey = `knot_pagination_categories`;
  const savedLimit =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem(storageKey))
      : 0;
  const initialNumItems = savedLimit > itemsPerPage ? savedLimit : itemsPerPage;

  const {
    results: categories,
    status: paginationStatus,
    loadMore: convexLoadMore,
  } = usePaginatedQuery(
    api.categories.getCategoriesPaginated,
    {},
    { initialNumItems },
  );

  const loadMore = (count: number) => {
    convexLoadMore(count);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        storageKey,
        String((categories?.length || 0) + count),
      );
    }
  };

  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const moveToBin = useMutation(api.trash.moveToBin);

  const isLoading =
    categories === undefined && paginationStatus === "LoadingFirstPage";

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
      await moveToBin({ id, type: "category" });
      toast.success("Category moved to Recycle Bin.");
    } catch (error) {
      toast.error("Failed to delete category.");
      throw error;
    }
  };

  return {
    categories,
    isLoading,
    paginationStatus,
    loadMore,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
