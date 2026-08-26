// src/features/items/components/form/ItemTypeToggle.tsx
import { FileText, Folder } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ItemTypeToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ItemTypeToggle({ value, onChange }: ItemTypeToggleProps) {
  return (
    <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border/60 shadow-inner">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
          !value
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
      >
        <FileText className="w-4 h-4" /> File
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
          value
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
      >
        <Folder className="w-4 h-4" /> Folder
      </button>
    </div>
  );
}
