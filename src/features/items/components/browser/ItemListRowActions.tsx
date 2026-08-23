//src/features/items/components/browser/ItemListRowActions.tsx
"use client";

import {
  MoreVertical,
  Edit2,
  Trash2,
  Info,
  ChevronRight,
  Folder,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface ItemListRowActionsProps {
  item: any;
  isEditMode: boolean;
  onDetailsClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (item: any) => void;
  onMoveClick: (item: any) => void;
}

export function ItemListRowActions({
  item,
  isEditMode,
  onDetailsClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}: ItemListRowActionsProps) {
  const isRiskPage = !!item.riskPath;

  if (isEditMode) {
    return (
      <div
        className="flex shrink-0 items-center justify-end self-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur-md outline-none transition-colors hover:bg-muted">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-xl border-border bg-card p-1.5 shadow-(--shadow-dropdown)"
          >
            <DropdownMenuItem
              onClick={() => onDetailsClick(item)}
              className="cursor-pointer rounded-lg px-2.5 py-2 font-medium hover:bg-muted"
            >
              <Info className="mr-2.5 h-4 w-4 text-muted-foreground" />
              Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditClick(item)}
              disabled={isRiskPage}
              className="cursor-pointer rounded-lg px-2.5 py-2 font-medium hover:bg-muted"
            >
              <Edit2 className="mr-2.5 h-4 w-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onMoveClick(item)}
              disabled={isRiskPage}
              className="cursor-pointer rounded-lg px-2.5 py-2 font-medium hover:bg-muted"
            >
              <Folder className="mr-2.5 h-4 w-4 text-muted-foreground" />
              Move
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border/60" />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteClick(item)}
              disabled={isRiskPage}
              className="cursor-pointer rounded-lg px-2.5 py-2 font-medium focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2.5 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full text-muted-foreground/40 transition-all duration-200 group-hover:bg-primary/[0.07] group-hover:text-primary">
      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </div>
  );
}
