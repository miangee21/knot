//src/features/items/components/browser/ItemListTable.tsx
"use client";

import { useState } from "react";
import { ItemListRow } from "./ItemListRow";

interface ItemListTableProps {
  items: any[];
  currentPath: string;
  allLocations: any[];
  onDetailsClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (item: any) => void;
  onMoveClick: (item: any) => void;
}

type ColumnWidths = {
  name: number;
  range: number;
  size: number;
  locations: number;
};

export function ItemListTable({
  items,
  currentPath,
  allLocations,
  onDetailsClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}: ItemListTableProps) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    name: 1.5,
    range: 1,
    size: 1,
    locations: 1,
  });

  const handleResizeStart = (
    column: keyof ColumnWidths,
    startX: number,
    containerWidth: number,
  ) => {
    const startWidths = { ...columnWidths };

    const columns: (keyof ColumnWidths)[] = [
      "name",
      "range",
      "size",
      "locations",
    ];

    const index = columns.indexOf(column);
    const nextColumn = columns[index + 1];

    if (!nextColumn) return;

    const startTotal = startWidths[column] + startWidths[nextColumn];

    const handleMouseMove = (event: MouseEvent) => {
      const delta = ((event.clientX - startX) / containerWidth) * 4.5;

      const minWidth = 0.5;

      let newCurrent = startWidths[column] + delta;
      let newNext = startWidths[nextColumn] - delta;

      if (newCurrent < minWidth) {
        newCurrent = minWidth;
        newNext = startTotal - minWidth;
      }

      if (newNext < minWidth) {
        newNext = minWidth;
        newCurrent = startTotal - minWidth;
      }

      setColumnWidths((prev) => ({
        ...prev,
        [column]: newCurrent,
        [nextColumn]: newNext,
      }));
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (items.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      {items.map((item) => (
        <ItemListRow
          key={item._id}
          item={item}
          currentPath={currentPath}
          allLocations={allLocations}
          columnWidths={columnWidths}
          onResizeStart={handleResizeStart}
          onDetailsClick={onDetailsClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onMoveClick={onMoveClick}
        />
      ))}
    </div>
  );
}
