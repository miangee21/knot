//src/app/(dashboard)/categories/page.tsx
"use client";

import * as React from "react";
import { Plus, Tag, Loader2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { CategoryList } from "@/features/categories/components/CategoryList";
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { SearchBar } from "@/shared/components/SearchBar";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryFormData } from "@/features/categories/types";
import { CategoryDoc } from "@/features/categories/components/CategoryCard";
import { useDebounce } from "@/shared/hooks/useDebounce";

export default function CategoriesPage() {
  const { categories, isLoading, handleCreate, handleUpdate, handleDelete } =
    useCategories();

  // Search States
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] =
    React.useState<CategoryDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete Confirmation State
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(
    null,
  );

  // Handlers
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

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await handleUpdate(editingCategory._id, data);
      } else {
        await handleCreate(data);
      }
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search Filter Logic
  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    if (!debouncedSearchTerm) return categories;

    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [categories, debouncedSearchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
      </div>
    );
  }

  // Boolean flags for empty states
  const hasNoCategoriesAtAll = categories && categories.length === 0;
  const hasNoSearchResults =
    categories && categories.length > 0 && filteredCategories.length === 0;

  return (
    <div className="flex flex-col space-y-2 animate-in fade-in-50 duration-500 pt-2 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Create visual tags to organize your physical and digital items.
          </p>
        </div>

        {/* Search Bar & Add Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Only show search bar if there is at least one category to search through */}
          {categories && categories.length > 0 && (
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
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

      {/* Main Content Area */}
      <div className="flex-1">
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
          <CategoryList
            categories={filteredCategories}
            onEdit={openEditDialog}
            onDelete={confirmDelete}
          />
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
