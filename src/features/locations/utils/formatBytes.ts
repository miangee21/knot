//src/features/locations/utils/formatBytes.ts
export function bytesToDisplay(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "Unknown";
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "Invalid"; // Handle negative safely

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Prevent out of bounds if size exceeds PB
  const validIndex = Math.min(i, sizes.length - 1);

  return (
    parseFloat((bytes / Math.pow(k, validIndex)).toFixed(1)) +
    " " +
    sizes[validIndex]
  );
}

export function capacityLevel(
  used?: number,
  total?: number,
): "low" | "medium" | "high" {
  if (!used || !total || total === 0) return "low";

  const percentage = (used / total) * 100;

  if (percentage >= 85) return "high"; // Red (Danger)
  if (percentage >= 60) return "medium"; // Blue (Warning)
  return "low"; // Green (Safe)
}
