//src/features/items/hooks/useUpdateItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ItemFormData } from "../types";

export type UpdateItemPayload = Omit<ItemFormData, "poster"> & {
  posterStorageId?: string;
  parentId?: string | null;
};

export function useUpdateItem() {
  const updateItem = useMutation(api.items.update);

  const handleUpdate = async (id: Id<"items">, data: UpdateItemPayload) => {
    // Safely update Convex DB with the new data
    const payload = {
      ...data,
      parentId: data.parentId as Id<"items"> | undefined | null,
      categoryId: data.categoryId as Id<"categories"> | undefined | null,
      locationIds: data.locationIds as Id<"locations">[],
      posterStorageId: data.posterStorageId as
        Id<"_storage"> | undefined | null,
    };
    await updateItem({ id, ...payload });
  };

  return { handleUpdate };
}
