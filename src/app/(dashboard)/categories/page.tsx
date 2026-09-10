//src/app/(dashboard)/categories/page.tsx
"use client";

import * as React from "react";
import { Plus, Tag, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { CategoryGrid } from "@/features/categories/components/CategoryGrid";
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { SearchBar } from "@/shared/components/SearchBar";
import { Pagination } from "@/shared/components/Pagination";
import { usePaginatedCategories } from "@/features/categories/hooks/useCategories";
import { CategoryFormData } from "@/features/categories/types";
import { CategoryDoc } from "@/features/categories/components/CategoryCard";
import { useDebounce } from "@/shared/hooks/useDebounce";

export default function CategoriesPage() {
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const {
    categories,
    isLoading,
    paginationStatus,
    loadMore,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = usePaginatedCategories(itemsPerPage);

  // Search States
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchResults = useQuery(
    api.categories.searchCategories,
    debouncedSearchTerm ? { query: debouncedSearchTerm } : "skip",
  );

  const isSearching = !!debouncedSearchTerm;
  const isSearchLoading = isSearching && searchResults === undefined;

  const currentCategories = isSearching
    ? searchResults || []
    : categories || [];
  const hasMoreToLoad =
    !isSearching &&
    (paginationStatus === "CanLoadMore" || paginationStatus === "LoadingMore");

  // 1. Auto-fill list
  React.useEffect(() => {
    if (
      !isSearching &&
      paginationStatus === "CanLoadMore" &&
      categories &&
      categories.length % itemsPerPage !== 0
    ) {
      loadMore(itemsPerPage - (categories.length % itemsPerPage));
    }
  }, [categories, isSearching, paginationStatus, loadMore, itemsPerPage]);

  // 2. Save scroll position
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const scrollKey = `knot_scroll_categories`;
    const handleScroll = () =>
      sessionStorage.setItem(scrollKey, String(mainEl.scrollTop));
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Restore scroll position
  React.useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl || isLoading || isSearchLoading) return;
    const scrollKey = `knot_scroll_categories`;
    const savedScroll = sessionStorage.getItem(scrollKey);
    if (savedScroll) {
      const timer = setTimeout(() => {
        mainEl.scrollTop = Number(savedScroll);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isSearchLoading]);

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] =
    React.useState<CategoryDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(
    null,
  );

  const openNewDialog = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (category: CategoryDoc) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };
  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
  };
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) await handleUpdate(editingCategory._id, data);
      else await handleCreate(data);
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Boolean flags for empty states
  const hasNoCategoriesAtAll = categories && categories.length === 0;
  const hasNoSearchResults =
    categories &&
    categories.length > 0 &&
    isSearching &&
    !isSearchLoading &&
    currentCategories.length === 0;

  return (
    <div className="flex flex-col animate-in fade-in-50 duration-500 w-full h-full relative">
      {/* Sticky Header Layer with Negative Margin Bleed */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pb-2 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 -mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Categories
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
              Create visual tags to organize your physical and digital items.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:mt-10">
            {categories && categories.length > 0 && (
              <SearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search categories..."
                className="sm:w-64"
              />
            )}

            <Button
              onClick={openNewDialog}
              className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:-translate-y-px transition-all h-11 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-4 px-1">
        {hasNoCategoriesAtAll ? (
          <EmptyState
            icon={Tag}
            title="No categories yet"
            description="Create your first category to start organizing your belongings."
            action={
              <Button
                onClick={openNewDialog}
                className="rounded-full px-6 h-11 font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Category
              </Button>
            }
          />
        ) : hasNoSearchResults ? (
          <EmptyState
            icon={XCircle}
            title="No results found"
            description={`We couldn't find any category matching "${searchTerm}".`}
            action={
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="rounded-full px-6 h-11 font-semibold border-border/80 hover:bg-muted"
              >
                Clear Search
              </Button>
            }
          />
        ) : (
          <>
            <CategoryGrid
              categories={currentCategories}
              onEdit={openEditDialog}
              onDelete={confirmDelete}
              isLoading={isLoading || isSearchLoading}
            />
            {!isSearching && !isLoading && !isSearchLoading && (
              <div className="mt-2">
                <Pagination
                  itemsPerPage={itemsPerPage}
                  hasMore={hasMoreToLoad}
                  onLoadMore={() => loadMore(itemsPerPage)}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Forms and Dialogs */}
      <CategoryFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={onSubmit}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={async () => {
          if (categoryToDelete) {
            try {
              await handleDelete(categoryToDelete);
            } finally {
              setCategoryToDelete(null);
            }
          }
        }}
        title="Delete Category"
        description="Are you sure you want to move this category to the Recycle Bin?"
      />
    </div>
  );
}
