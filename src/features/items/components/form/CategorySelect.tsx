//src/features/items/components/form/CategorySelect.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { CategoryDoc } from "@/features/categories/components/CategoryCard";

export function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: CategoryDoc[];
  value: string | null | undefined;
  onChange: (val: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedCat = categories.find((c) => c._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-11 rounded-xl bg-background border-border/80 hover:border-primary/50 hover:bg-background font-normal px-4"
          />
        }
      >
        <span
          className={selectedCat ? "text-foreground" : "text-muted-foreground"}
        >
          {selectedCat ? selectedCat.name : "Inherit or None"}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-full sm:w-64 p-0 rounded-2xl border-border bg-card shadow-(--shadow-dropdown)">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList className="custom-scrollbar">
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-xl my-1 hover:bg-muted font-medium"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-primary",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
                Inherit or None
              </CommandItem>
              {categories.map((cat) => (
                <CommandItem
                  key={cat._id}
                  onSelect={() => {
                    onChange(cat._id);
                    setOpen(false);
                  }}
                  className="cursor-pointer rounded-xl my-1 hover:bg-muted font-medium"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === cat._id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
