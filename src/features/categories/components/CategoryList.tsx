//src/features/categories/components/CategoryList.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryCard, CategoryDoc } from "./CategoryCard";
import { Button } from "@/shared/components/ui/button";

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
      {totalItems > 5 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          {/* Left: Items per page dropdown */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <span>Show</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="appearance-none bg-background border border-border hover:border-border/80 rounded-xl px-3 py-1.5 pr-8 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-foreground"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
              {/* Custom arrow for select */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <span>entries</span>
          </div>

          {/* Right: Page navigation */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground hidden md:inline-block font-medium">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
              {totalItems}
            </span>

            {!isAll && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg border-border hover:bg-muted"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center px-3 font-semibold text-foreground bg-muted/50 h-8 rounded-lg">
                  {currentPage}{" "}
                  <span className="text-muted-foreground font-normal mx-1">
                    /
                  </span>{" "}
                  {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg border-border hover:bg-muted"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
