//src/features/items/components/form/RangeInput.tsx
"use client";

import * as React from "react";
import { Switch } from "@/shared/components/ui/switch";

interface RangeInputProps {
  startValue?: number;
  endValue?: number;
  onChange: (start?: number, end?: number) => void;
}

export function RangeInput({
  startValue,
  endValue,
  onChange,
}: RangeInputProps) {
  const [isRange, setIsRange] = React.useState(!!(startValue || endValue));

  const handleToggle = (checked: boolean) => {
    setIsRange(checked);
    if (!checked) {
      onChange(undefined, undefined);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between gap-3 p-2 px-3 rounded-xl bg-background border border-border/80 transition-all h-11">
      <div className="flex items-center gap-2 shrink-0">
        <Switch checked={isRange} onCheckedChange={handleToggle} />
        <label className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
          (e.g., 1 - 20)
        </label>
      </div>

      {isRange && (
        <div className="flex flex-row items-center gap-1.5 animate-in fade-in duration-300">
          <input
            type="number"
            placeholder="Start"
            value={startValue || ""}
            onChange={(e) =>
              onChange(
                e.target.value ? Number(e.target.value) : undefined,
                endValue,
              )
            }
            className="w-16 h-8 bg-card border border-border/80 rounded-md px-2 text-sm text-center outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <span className="text-muted-foreground font-medium">-</span>
          <input
            type="number"
            placeholder="End"
            value={endValue || ""}
            onChange={(e) =>
              onChange(
                startValue,
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="w-16 h-8 bg-card border border-border/80 rounded-md px-2 text-sm text-center outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      )}
    </div>
  );
}
