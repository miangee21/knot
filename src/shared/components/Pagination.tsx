//src/shared/components/Pagination.tsx
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PaginationProps {
  itemsPerPage: number;
  onItemsPerPageChange: (val: number) => void;
  onLoadMore: () => void;
  hasMore?: boolean;
}

export function Pagination({
  itemsPerPage,
  onItemsPerPageChange,
  onLoadMore,
  hasMore = false,
}: PaginationProps) {
  const [isSpinning, setIsSpinning] = React.useState(false);

  if (!hasMore) return null;

  const handleLoadMore = () => {
    setIsSpinning(true);
    setTimeout(() => {
      onLoadMore();
      setIsSpinning(false);
    }, 350);
  };

  return (
    <div className="relative flex w-full items-center justify-center py-4 mb-4">
      {/* Dropdown locked to bottom-left */}
      <div className="absolute left-1 bottom-4">
        <div className="relative">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
            }}
            className="appearance-none bg-background border border-border hover:border-border/80 rounded-lg px-2.5 py-1.5 pr-7 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-foreground text-xs shadow-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg
              width="8"
              height="5"
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
      </div>

      <Button
        onClick={handleLoadMore}
        disabled={isSpinning}
        className="rounded-full px-8 h-11 bg-primary/10 hover:bg-primary/20 text-primary font-bold shadow-sm transition-all min-w-35"
      >
        {isSpinning ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}
