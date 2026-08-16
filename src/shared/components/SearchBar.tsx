//src/shared/components/SearchBar.tsx
"use client";

import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 bg-card border border-border/60 hover:border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-full pl-10 pr-4 text-sm font-medium outline-none transition-all shadow-sm placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
