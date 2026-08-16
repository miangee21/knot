//src/features/items/components/form/SizeInput.tsx
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface SizeInputProps {
  valueBytes?: number;
  onChange: (bytes?: number) => void;
}

export function SizeInput({ valueBytes, onChange }: SizeInputProps) {
  const initialUnit = "GB";
  const [unit, setUnit] = React.useState<"MB" | "GB" | "TB">(initialUnit);

  const displayValue = React.useMemo(() => {
    if (!valueBytes) return "";
    if (unit === "MB") return valueBytes / (1024 * 1024);
    if (unit === "GB") return valueBytes / (1024 * 1024 * 1024);
    if (unit === "TB") return valueBytes / (1024 * 1024 * 1024 * 1024);
    return "";
  }, [valueBytes, unit]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    if (!val) {
      onChange(undefined);
      return;
    }

    let bytes = val;
    if (unit === "MB") bytes = val * 1024 * 1024;
    if (unit === "GB") bytes = val * 1024 * 1024 * 1024;
    if (unit === "TB") bytes = val * 1024 * 1024 * 1024 * 1024;

    onChange(bytes);
  };

  const handleUnitChange = (newUnit: "MB" | "GB" | "TB") => {
    setUnit(newUnit);
    if (displayValue) {
      const val = Number(displayValue);
      let bytes = val;
      if (newUnit === "MB") bytes = val * 1024 * 1024;
      if (newUnit === "GB") bytes = val * 1024 * 1024 * 1024;
      if (newUnit === "TB") bytes = val * 1024 * 1024 * 1024 * 1024;
      onChange(bytes);
    }
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        type="number"
        step="any"
        placeholder="e.g. 1.5"
        value={displayValue}
        onChange={handleNumberChange}
        className="w-24 h-11 bg-background border border-border/80 rounded-xl px-3 text-sm text-center outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
      />
      <div className="shrink-0 w-20">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between w-full h-11 bg-background border border-border/80 rounded-xl px-3 text-sm font-semibold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all">
            {unit}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-20 rounded-2xl border-border bg-card shadow-lg p-1.5">
            <DropdownMenuItem
              onClick={() => handleUnitChange("MB")}
              className="rounded-xl cursor-pointer py-2 px-3 text-sm font-semibold hover:bg-muted"
            >
              MB
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUnitChange("GB")}
              className="rounded-xl cursor-pointer py-2 px-3 text-sm font-semibold hover:bg-muted"
            >
              GB
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUnitChange("TB")}
              className="rounded-xl cursor-pointer py-2 px-3 text-sm font-semibold hover:bg-muted"
            >
              TB
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
