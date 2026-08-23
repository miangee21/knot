//src/features/risk/hooks/useRiskAnalysis.ts
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useMemo } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export function useRiskAnalysis() {
  const allItems = useQuery(api.items.getAllItemsFlat);

  const riskItems = useMemo(() => {
    if (!allItems) return undefined;

    const itemMap = new Map(allItems.map((i) => [i._id, i]));

    // Helper: Resolve inherited locations
    const getEffectiveLocations = (itemId: Id<"items">): string[] => {
      const locations = new Set<string>();
      let currentItem = itemMap.get(itemId);

      while (currentItem) {
        if (currentItem.locationIds) {
          currentItem.locationIds.forEach((id: string) => locations.add(id));
        }
        currentItem = currentItem.parentId
          ? itemMap.get(currentItem.parentId)
          : undefined;
      }
      return Array.from(locations);
    };

    // Helper: Build Breadcrumb Path
    const getRiskPath = (itemId: Id<"items">): string => {
      const path = [];
      let currentItem = itemMap.get(itemId);

      while (currentItem) {
        path.unshift(currentItem.name);
        currentItem = currentItem.parentId
          ? itemMap.get(currentItem.parentId)
          : undefined;
      }
      return ["Home", ...path].join(" > ");
    };

    // Filter: We only want LEAF items (files) that have exactly 1 effective location
    const vulnerableItems = allItems
      .filter((item) => !item.isFolder) // Only check actual files
      .map((item) => {
        const effectiveLocations = getEffectiveLocations(item._id);
        return {
          ...item,
          effectiveLocations,
          riskPath: getRiskPath(item._id), // Inject path for the UI
        };
      })
      .filter((item) => item.effectiveLocations.length === 1); // EXACTLY 1 location = At Risk

    return vulnerableItems;
  }, [allItems]);

  return {
    riskItems,
    isLoading: allItems === undefined,
  };
}
