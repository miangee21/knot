//src/features/items/utils/fromatRange.ts
/**
 * Formats a start and end value into a readable range string.
 * Example: (1, 20) -> "1 - 20"
 * Example: (1, undefined) -> "1"
 * Example: (undefined, undefined) -> ""
 */
export function formatRange(start?: number, end?: number): string {
  if (start !== undefined && end !== undefined) {
    // Both are present, only add dash if they are different
    if (start === end) return `${start}`;
    return `${start} - ${end}`;
  }

  if (start !== undefined) {
    return `${start}`;
  }

  if (end !== undefined) {
    return `${end}`; // Rare case, usually start is filled first
  }

  return "";
}
