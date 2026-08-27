//src/features/categories/components/IconPicker.tsx
"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import * as LucideIcons from "lucide-react";

// Curated list tailored for digital assets, media, files, and physical storage
export const CURATED_ICONS = [
  // Folders & Archives (zip, rar, iso, dirs)
  "Folder",
  "FolderOpen",
  "FolderArchive",
  "FolderTree",
  "Archive",
  "Package",
  "Box",

  // Files & Documents (pdf, doc, excel)
  "File",
  "FileText",
  "FileSpreadsheet",
  "FileCode",
  "FileArchive",
  "FileImage",
  "FileVideo",
  "FileAudio",
  "Clipboard",
  "Paperclip",

  // Media (Movies, Series, Pics)
  "Film",
  "Video",
  "Tv",
  "Clapperboard",
  "MonitorPlay",
  "Image",
  "Images",
  "Camera",
  "Music",
  "Headphones",
  "Mic",

  // Tech & Storage Drives
  "Database",
  "HardDrive",
  "Server",
  "Cloud",
  "Usb",
  "Cpu",
  "Monitor",
  "Laptop",
  "Smartphone",

  // Tags & Categorization
  "Tag",
  "Tags",
  "Bookmark",
  "Hash",
  "Flag",
  "Layers",
  "LayoutGrid",

  // Miscellaneous
  "Code",
  "Terminal",
  "GitBranch",
  "Book",
  "BookOpen",
  "Library",
  "Briefcase",
  "Shield",
  "Lock",
  "Key",
] as const;

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredIcons = CURATED_ICONS.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
          className="w-full bg-background/50 ring-1 ring-border/50 focus:ring-2 focus:ring-primary/60 h-10 rounded-xl pl-9 pr-4 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-35 overflow-y-auto p-1 pr-2 custom-scrollbar">
        {filteredIcons.map((iconName) => {
          // Dynamically grab the component from Lucide
          const IconComponent = LucideIcons[
            iconName as keyof typeof LucideIcons
          ] as React.ElementType;
          if (!IconComponent) return null;

          const isSelected = value === iconName;

          return (
            <button
              key={iconName}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iconName)}
              title={iconName}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                  : "bg-background border-border/40 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground",
                disabled && "opacity-50 pointer-events-none",
              )}
            >
              <IconComponent
                className={cn(
                  "w-5 h-5",
                  isSelected && "animate-in zoom-in duration-300",
                )}
              />
            </button>
          );
        })}

        {filteredIcons.length === 0 && (
          <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
            No icons found for "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
