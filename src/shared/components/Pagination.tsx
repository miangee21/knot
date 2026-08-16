//src/shared/components/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number | "all";
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (val: number | "all") => void;
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  if (totalItems <= 5) return null;

  const isAll = itemsPerPage === "all";
  const totalPages = isAll
    ? 1
    : Math.ceil(totalItems / (itemsPerPage as number));
  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
      {/* Left: Items per page dropdown */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
        <span>Show</span>
        <div className="relative">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const val = e.target.value;
              onItemsPerPageChange(val === "all" ? "all" : Number(val));
            }}
            className="appearance-none bg-background border border-border hover:border-border/80 rounded-xl px-3 py-1.5 pr-8 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-foreground"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
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
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center px-3 font-semibold text-foreground bg-muted/50 h-8 rounded-lg">
              {currentPage}{" "}
              <span className="text-muted-foreground font-normal mx-1">/</span>{" "}
              {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg border-border hover:bg-muted"
              disabled={currentPage === totalPages}
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
