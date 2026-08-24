//src/features/locations/hooks/useLocations.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LocationFormData } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useLocations() {
  const locations = useQuery(api.locations.getLocations);
  const createLocation = useMutation(api.locations.createLocation);
  const updateLocation = useMutation(api.locations.updateLocation);
  const moveToBin = useMutation(api.trash.moveToBin);
  const router = useRouter();

  const isLoading = locations === undefined;

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
    } catch (error: any) {
      if (error.message.includes("LOCATION_HAS_ITEMS")) {
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
      throw error; // Let the component know it failed so it can reset state
    }
  };

  return {
    locations,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
