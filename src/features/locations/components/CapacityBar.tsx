//src/features/locations/components/CapacityBar.tsx
import { Progress } from "@/shared/components/ui/progress";
import { capacityLevel } from "../utils/formatBytes";
import { cn } from "@/shared/lib/utils";

interface CapacityBarProps {
  usedBytes?: number;
  totalBytes?: number;
  className?: string;
}

export function CapacityBar({
  usedBytes,
  totalBytes,
  className,
}: CapacityBarProps) {
  // If data is missing, show an empty bar
  if (usedBytes === undefined || totalBytes === undefined || totalBytes === 0) {
    return (
      <Progress
        value={0}
        className={cn("h-1.5 w-full bg-secondary", className)}
      />
    );
  }

  const percentage = Math.min(100, Math.max(0, (usedBytes / totalBytes) * 100));
  const level = capacityLevel(usedBytes, totalBytes);

  // Dynamically applying the background color to the inner indicator div
  const indicatorColorClass =
    level === "high"
      ? "[&>div]:bg-capacity-high"
      : level === "medium"
        ? "[&>div]:bg-capacity-medium"
        : "[&>div]:bg-capacity-low";

  return (
    <Progress
      value={percentage}
      className={cn(
        "h-1.5 w-full bg-secondary/50",
        indicatorColorClass,
        className,
      )}
    />
  );
}
