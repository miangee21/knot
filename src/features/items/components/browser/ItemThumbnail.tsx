//src/features/items/components/browser/ItemThumbnail.tsx
"use client";

import { Folder, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ItemThumbnailProps {
  posterUrl?: string | null;
  isFolder?: boolean;
  className?: string;
  iconClassName?: string;
  variant?: "grid" | "list";
}

export function ItemThumbnail({
  posterUrl,
  isFolder,
  className,
  iconClassName,
  variant = "grid",
}: ItemThumbnailProps) {
  // Poster available — keep the real image exactly as before
  if (posterUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={posterUrl}
        alt="Thumbnail"
        className={cn("object-cover", className)}
      />
    );
  }

  // Minimal thumbnail for List View
  if (variant === "list") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-primary/4",
          className,
        )}
      >
        {isFolder ? (
          <Folder
            className={cn("text-primary/60 fill-primary/12", iconClassName)}
            strokeWidth={1.7}
          />
        ) : (
          <FileText
            className={cn("text-muted-foreground/50", iconClassName)}
            strokeWidth={1.7}
          />
        )}
      </div>
    );
  }

  // Premium poster-less thumbnail for Grid View
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        "bg-linear-to-br from-primary/[0.07] via-muted/40 to-primary/3",
        className,
      )}
    >
      {/* Soft background glow */}
      <div
        className="
          pointer-events-none absolute
          -right-10 -top-10
          h-32 w-32 rounded-full
          bg-primary/[0.07]
          blur-2xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-12 -left-10
          h-32 w-32 rounded-full
          bg-primary/5
          blur-2xl
        "
      />

      {/* Very subtle decorative grid */}
      <div
        className="
          pointer-events-none absolute inset-0 opacity-[0.035]
          bg-grid-pattern bg-size-[24px_24px]
        "
      />

      {/* Main icon */}
      <div
        className="
          relative flex aspect-square w-[75%] max-w-24 items-center justify-center
          rounded-2xl lg:rounded-[1.75rem]
          border border-primary/10
          bg-background/65
          shadow-sm
          backdrop-blur-sm
          ring-1 ring-inset ring-white/40
          transition-all duration-300
          group-hover:scale-105
          group-hover:border-primary/20
          group-hover:bg-background/80
          group-hover:shadow-md
        "
      >
        {/* Inner glow */}
        <div
          className="
            pointer-events-none absolute inset-[15%]
            rounded-2xl
            bg-primary/5.5
          "
        />

        {isFolder ? (
          <Folder
            className={cn(
              "relative z-10 w-3/5 h-3/5 max-w-14 max-h-14 text-primary/60",
              "fill-primary/12",
              "transition-all duration-300",
              "group-hover:text-primary/75",
              "group-hover:scale-105",
              iconClassName,
            )}
            strokeWidth={1.7}
          />
        ) : (
          <FileText
            className={cn(
              "relative z-10 w-3/5 h-3/5 max-w-14 max-h-14 text-muted-foreground/50",
              "transition-all duration-300",
              "group-hover:text-primary/65",
              "group-hover:scale-105",
              iconClassName,
            )}
            strokeWidth={1.7}
          />
        )}
      </div>
    </div>
  );
}
