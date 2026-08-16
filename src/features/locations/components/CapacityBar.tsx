//src/features/locations/components/CapacityBar.tsx
"use client";

import { capacityLevel } from "../utils/formatBytes";

interface CapacityBarProps {
  usedBytes?: number;
  totalBytes?: number;
}

export function CapacityBar({
  usedBytes = 0,
  totalBytes = 0,
}: CapacityBarProps) {
  // Calculate percentage to set the width of the progress bar
  const percentage =
    totalBytes > 0 ? Math.min((usedBytes / totalBytes) * 100, 100) : 0;

  // Get the danger level using your utility function
  const level = capacityLevel(usedBytes, totalBytes);

  // Dynamically assign colors from globals.css based on the level
  const colorClass =
    level === "high"
      ? "bg-[hsl(var(--capacity-high))]"
      : level === "medium"
        ? "bg-[hsl(var(--capacity-medium))]"
        : "bg-[hsl(var(--capacity-low))]";

  return (
    <div className="h-1.5 w-full bg-secondary/80 overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
