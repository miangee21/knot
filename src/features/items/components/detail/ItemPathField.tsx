//src/features/items/components/detail/ItemPathField.tsx
"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/components/ui/tooltip";
import { ItemDoc } from "../../types";

interface ItemPathFieldProps {
  ancestors: ItemDoc[];
  itemName: string;
}

export function ItemPathField({ ancestors, itemName }: ItemPathFieldProps) {
  const [copied, setCopied] = React.useState(false);

  const pathArray = [
    "Home",
    ...ancestors.map((a: ItemDoc) => a.name),
    itemName,
  ];
  const fullPath = pathArray.join(" > ");

  const displayPath =
    pathArray.length > 3
      ? `${pathArray[0]} > ... > ${pathArray[pathArray.length - 2]} > ${pathArray[pathArray.length - 1]}`
      : fullPath;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPath);
      setCopied(true);
      toast.success("Path copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy path.");
      console.error("Clipboard error:", error);
    }
  };

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <div className="mb-3 flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50">
          <TooltipTrigger
            render={
              <div className="flex min-w-0 flex-1 cursor-default items-center text-[11px] font-medium text-muted-foreground/90" />
            }
          >
            <span className="truncate">{displayPath}</span>
          </TooltipTrigger>

          <TooltipContent
            side="bottom"
            className="max-w-[320px] text-center leading-relaxed whitespace-normal wrap-break-word shadow-2xl"
          >
            {fullPath}
          </TooltipContent>

          <button
            onClick={handleCopy}
            className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background/50 border border-border/50 text-muted-foreground transition-all hover:bg-background hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}
