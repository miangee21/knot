//src/features/categories/components/CategoryList.tsx
"use client";

import * as React from "react";
import { CategoryCard, CategoryDoc } from "./CategoryCard";
import { Pagination } from "@/shared/components/Pagination";

interface CategoryListProps {
  categories: CategoryDoc[];
  onEdit: (category: CategoryDoc) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  // Reset to page 1 if user changes "items per page" dropdown
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const val = e.target.value;
    setItemsPerPage(val === "all" ? "all" : Number(val));
    setCurrentPage(1);
  };

  const totalItems = categories.length;
  const isAll = itemsPerPage === "all";
  const totalPages = isAll
    ? 1
    : Math.ceil(totalItems / (itemsPerPage as number));

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
