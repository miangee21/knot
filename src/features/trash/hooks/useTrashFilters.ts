//src/features/trash/hooks/useTrashFilters.ts
export type TrashType = "item" | "category" | "location";

export const TAB_CONFIG = [
  { id: "item" as TrashType, label: "Items", key: "items" },
  { id: "category" as TrashType, label: "Categories", key: "categories" },
  { id: "location" as TrashType, label: "Locations", key: "locations" },
];
