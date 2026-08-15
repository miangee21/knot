//src/features/locations/hooks/useLocations.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LocationFormData } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useLocations() {
  const locations = useQuery(api.locations.getLocations);
  const createLocation = useMutation(api.locations.createLocation);
  const updateLocation = useMutation(api.locations.updateLocation);
  const deleteLocation = useMutation(api.locations.deleteLocation);

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
      await deleteLocation({ id: id as Id<"locations"> });
      toast.success("Location deleted.");
    } catch (error) {
      toast.error("Failed to delete location.");
      throw error;
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
