//src/features/items/hooks/useCreateItem.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ItemFormData } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";

export type CreateItemPayload = Omit<ItemFormData, "poster"> & {
  posterStorageId?: string;
};

export function useCreateItem() {
  const createItem = useMutation(api.items.create);

  const handleCreate = async (data: CreateItemPayload) => {
    try {
      const payload = {
        ...data,
        parentId: data.parentId as Id<"items"> | undefined | null,
        categoryId: data.categoryId as Id<"categories"> | undefined | null,
        locationIds: data.locationIds as Id<"locations">[],
        posterStorageId: data.posterStorageId as
          Id<"_storage"> | undefined | null,
      };
      const newItemId = await createItem(payload);
      return newItemId;
    } catch (error) {
      console.error("Failed to create item:", error);
      throw error;
    }
  };

  return { handleCreate };
}
