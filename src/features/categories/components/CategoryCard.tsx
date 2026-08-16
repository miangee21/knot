//src/features/categories/components/CategoryCard.tsx
"use client";

import { MoreVertical, Edit2, Trash2, Tag } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export interface CategoryDoc {
  _id: string;
  name: string;
  icon: string;
}

interface CategoryCardProps {
  category: CategoryDoc;
  onEdit: (category: CategoryDoc) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const IconComponent = (LucideIcons as any)[category.icon] || Tag;

  return (
    <div className="group flex items-center justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-lg dark:bg-white/3 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
          <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="font-extrabold text-base text-foreground tracking-tight truncate">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5 opacity-80">
            Category
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors outline-none cursor-pointer border-none bg-transparent appearance-none">
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36 rounded-2xl p-1.5 border-border bg-card shadow-2xl"
        >
          <DropdownMenuItem
            onClick={() => onEdit(category)}
            className="rounded-xl cursor-pointer py-1.5 px-3 text-sm font-semibold hover:bg-muted"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border h-px my-1 mx-1" />
          <DropdownMenuItem
            onClick={() => onDelete(category._id)}
            className="rounded-xl cursor-pointer py-1.5 px-3 text-sm font-semibold text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
