//src/features/locations/hooks/useLocations.ts
"use client";

import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LocationFormData } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 1. Hook for Dropdowns (Flat List - used by BrowsePage)
export function useLocations() {
  const locations = useQuery(api.locations.getLocations);
  return { locations, isLoading: locations === undefined };
}

// 2. Hook for Locations Page (Paginated - used by LocationsPage)
export function usePaginatedLocations(itemsPerPage: number = 10) {
  const storageKey = `knot_pagination_locations`;
  const savedLimit =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem(storageKey))
      : 0;
  const initialNumItems = savedLimit > itemsPerPage ? savedLimit : itemsPerPage;

  const {
    results: locations,
    status: paginationStatus,
    loadMore: convexLoadMore,
  } = usePaginatedQuery(
    api.locations.getLocationsPaginated,
    {},
    { initialNumItems },
  );

  const loadMore = (count: number) => {
    convexLoadMore(count);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        storageKey,
        String((locations?.length || 0) + count),
      );
    }
  };

  const createLocation = useMutation(api.locations.createLocation);
  const updateLocation = useMutation(api.locations.updateLocation);
  const moveToBin = useMutation(api.trash.moveToBin);
  const router = useRouter();

  const isLoading =
    locations === undefined && paginationStatus === "LoadingFirstPage";

  const handleCreate = async (data: LocationFormData) => {
    try {
      await createLocation(data);
      toast.success("Location added successfully!");
    } catch (error) {
      toast.error("Failed to add location.");
      throw error;
    }
  };

  const handleUpdate = async (id: string, data: LocationFormData) => {
    try {
      await updateLocation({ id: id as Id<"locations">, ...data });
      toast.success("Location updated successfully!");
    } catch (error) {
      toast.error("Failed to update location.");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await moveToBin({ id, type: "location" });
      toast.success("Location moved to Recycle Bin.");
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("LOCATION_HAS_ITEMS")
      ) {
        toast.error("Cannot delete. This location is used by items.", {
          action: {
            label: "View Items",
            onClick: () => router.push(`/browse?locationFilterId=${id}`),
          },
          duration: 10000,
        });
      } else {
        toast.error("Failed to delete location.");
      }
      throw error;
    }
  };

  return {
    locations,
    isLoading,
    paginationStatus,
    loadMore,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
