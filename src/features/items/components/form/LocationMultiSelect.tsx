//src/features/items/components/form/LocationMultiSelect.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { LocationDoc } from "@/features/locations/components/LocationCard";

interface LocationMultiSelectProps {
  allLocations: LocationDoc[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  inheritedIds?: string[]; // IDs inherited from parent
}

export function LocationMultiSelect({
  allLocations,
  selectedIds,
  onChange,
  inheritedIds = [],
}: LocationMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleLocation = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((locId) => locId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Determine what to show in the live badges below
  const isInheriting = selectedIds.length === 0;
  const displayIds = isInheriting ? inheritedIds : selectedIds;
  const displayLocations = allLocations.filter((loc) =>
    displayIds.includes(loc._id),
  );

  return (
    <div className="flex flex-col gap-1.5">
      {/* Wrapper to keep button and badges in the same line */}
      <div className="flex flex-row flex-wrap items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                className="w-64 justify-between h-11 rounded-xl bg-background border-border/80 hover:border-primary/50 hover:bg-background font-normal shrink-0"
              />
            }
          >
            <span className="text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} location(s) selected`
                : "Inherit from parent (leave empty)"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 rounded-2xl border-border bg-card shadow-dropdown">
            <Command>
              <CommandInput placeholder="Search locations..." />
              <CommandList className="custom-scrollbar">
                <CommandEmpty>No location found.</CommandEmpty>
                <CommandGroup>
                  {allLocations.map((location) => (
                    <CommandItem
                      key={location._id}
                      onSelect={() => toggleLocation(location._id)}
                      className="cursor-pointer rounded-xl my-1 hover:bg-muted font-medium"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          selectedIds.includes(location._id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {location.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Live Resolved Badges Inline */}
        {displayLocations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {displayLocations.map((loc) => (
              <div
                key={loc._id}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  isInheriting
                    ? "bg-muted/50 text-muted-foreground border border-border/50" // Muted for inherited
                    : "bg-primary/10 text-primary border border-primary/20", // Solid for explicit
                )}
              >
                <MapPin className="w-3 h-3" />
                {loc.name}
              </div>
            ))}
            {isInheriting && (
              <span className="text-[10px] text-muted-foreground italic ml-1 self-center">
                (Inherited)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
