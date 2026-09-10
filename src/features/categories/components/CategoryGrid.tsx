//src/features/categories/components/CategoryGrid.tsx
"use client";

import { CategoryCard, CategoryDoc } from "./CategoryCard";
import { Loader2 } from "lucide-react";

interface CategoryGridProps {
  categories: CategoryDoc[];
  onEdit: (category: CategoryDoc) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function CategoryGrid({
  categories,
  onEdit,
  onDelete,
  isLoading,
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
