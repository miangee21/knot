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
  const [isRange, setIsRange] = React.useState(
    startValue !== undefined || endValue !== undefined,
  );

  React.useEffect(() => {
    setIsRange(startValue !== undefined || endValue !== undefined);
  }, [startValue, endValue]);

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
            min="0"
            placeholder="Start"
            value={startValue ?? ""}
            onChange={(e) => {
              const val =
                e.target.value !== ""
                  ? Math.max(0, Number(e.target.value))
                  : undefined;

              if (
                val !== undefined &&
                endValue !== undefined &&
                val > endValue
              ) {
                onChange(val, val);
              } else {
                onChange(val, endValue);
              }
            }}
            className="w-16 h-8 bg-card border border-border/80 rounded-md px-2 text-sm text-center outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <span className="text-muted-foreground font-medium">-</span>
          <input
            type="number"
            min={startValue ?? 0}
            placeholder="End"
            value={endValue ?? ""}
            onChange={(e) => {
              const val =
                e.target.value !== ""
                  ? Math.max(0, Number(e.target.value))
                  : undefined;
              onChange(startValue, val);
            }}
            className="w-16 h-8 bg-card border border-border/80 rounded-md px-2 text-sm text-center outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      )}
    </div>
  );
}
