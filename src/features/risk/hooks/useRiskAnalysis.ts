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
        // Since we explicitly set locations on creation now, we just use the item's own array!
        const effectiveLocations = item.locationIds || [];
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
