//src/features/locations/components/LocationGrid.tsx
"use client";

import { LocationCard, LocationDoc } from "./LocationCard";

interface LocationGridProps {
  locations: LocationDoc[];
  locationCounts: Record<string, number>;
  onEdit: (location: LocationDoc) => void;
  onDelete: (id: string) => void;
}

export function LocationGrid({
  locations,
  locationCounts,
  onEdit,
  onDelete,
}: LocationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {locations.map((location) => (
        <LocationCard
          key={location._id}
          location={location}
          itemCount={locationCounts[location._id] || 0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
