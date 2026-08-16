//src/features/items/utils/resolveInheritance.ts
export interface ItemInheritanceNode {
  categoryId?: string;
  locationIds?: string[];
}

/**
 * Walks up the ancestor chain (nearest first) to find the effective category and locations.
 * @param item The current item being evaluated.
 * @param ancestors Array of ancestors sorted from nearest (parent) to furthest (root).
 */
export function resolveInheritance(
  item: ItemInheritanceNode,
  ancestors: ItemInheritanceNode[],
) {
  let effectiveCategoryId = item.categoryId;
  let isCategoryInherited = false;

  // Resolve Category
  if (!effectiveCategoryId) {
    const ancestorWithCategory = ancestors.find((a) => a.categoryId);
    if (ancestorWithCategory?.categoryId) {
      effectiveCategoryId = ancestorWithCategory.categoryId;
      isCategoryInherited = true;
    }
  }

  let effectiveLocationIds = item.locationIds || [];
  let areLocationsInherited = false;

  // Resolve Locations (if empty array or undefined)
  if (effectiveLocationIds.length === 0) {
    const ancestorWithLocations = ancestors.find(
      (a) => a.locationIds && a.locationIds.length > 0,
    );
    if (ancestorWithLocations?.locationIds) {
      effectiveLocationIds = ancestorWithLocations.locationIds;
      areLocationsInherited = true;
    }
  }

  return {
    effectiveCategoryId,
    effectiveLocationIds,
    isInherited: {
      category: isCategoryInherited,
      locations: areLocationsInherited,
    },
  };
}
