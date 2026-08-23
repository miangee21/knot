//src/features/items/components/browser/ItemGrid.tsx
"use client";

import { ItemGridCard } from "./ItemGridCard";

interface ItemGridProps {
  items: any[];
  currentPath: string;
  allLocations: any[];
  onDetailsClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (item: any) => void;
  onMoveClick: (item: any) => void;
}

export function ItemGrid({
  items,
  currentPath,
  allLocations,
  onDetailsClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}: ItemGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {items.map((item) => (
        <ItemGridCard
          key={item._id}
          item={item}
          currentPath={currentPath}
          allLocations={allLocations}
          onDetailsClick={onDetailsClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onMoveClick={onMoveClick}
        />
      ))}
    </div>
  );
}
