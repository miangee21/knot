//src/features/categories/components/CategoryGrid.tsx
"use client";

import * as React from "react";
import { CategoryCard, CategoryDoc } from "./CategoryCard";
import { Pagination } from "@/shared/components/Pagination";

interface CategoryGridProps {
  categories: CategoryDoc[];
  onEdit: (category: CategoryDoc) => void;
  onDelete: (id: string) => void;
}

export function CategoryGrid({
  categories,
  onEdit,
  onDelete,
}: CategoryGridProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  const totalItems = categories.length;
  const isAll = itemsPerPage === "all";

  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);

  // Slice the array based on pagination
  const currentCategories = categories.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentCategories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
