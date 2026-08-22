//src/features/items/components/browser/ItemBreadcrumb.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface ItemBreadcrumbProps {
  ancestors?: Array<{ _id: string; name: string }>;
}

export function ItemBreadcrumb({ ancestors }: ItemBreadcrumbProps) {
  if (!ancestors) return null;

  const itemsCount = ancestors.length;

  // Helper to construct the dynamic route path segment array
  const buildPath = (index: number) => {
    const pathIds = ancestors.slice(0, index + 1).map((a) => a._id);
    return `/browse/${pathIds.join("/")}`;
  };

  // If no ancestors, we are at the root level
  if (itemsCount === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2 font-bold text-lg">
              <Home className="w-5 h-5" />
              Home
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // If less than or equal to 4 levels, show all normally
  const showAll = itemsCount <= 4;

  const firstItem = ancestors[0];
  const lastItem = ancestors[itemsCount - 1];

  // Slice the items between the first and last
  const middleItems = showAll
    ? ancestors.slice(1, -1)
    : ancestors.slice(1, itemsCount - 1);

  return (
    <Breadcrumb>
      <BreadcrumbList className="sm:text-lg">
        {/* Root Home Link */}
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href="/browse" />}
            className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* First Ancestor */}
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href={buildPath(0)} />}
            className="font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            {firstItem.name}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Middle Items (Ellipsis Dropdown or Normal Links) */}
        {itemsCount > 1 && (
          <>
            <BreadcrumbSeparator />
            {showAll ? (
              middleItems.map((item, idx) => (
                <React.Fragment key={item._id}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      render={<Link href={buildPath(idx + 1)} />}
                      className="font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </React.Fragment>
              ))
            ) : (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary outline-none">
                      <BreadcrumbEllipsis className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="rounded-xl border-border bg-card shadow-(--shadow-dropdown)"
                    >
                      {middleItems.map((item, idx) => (
                        <DropdownMenuItem
                          key={item._id}
                          render={<Link href={buildPath(idx + 1)} />}
                          className="rounded-lg cursor-pointer font-medium py-2 px-3"
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
          </>
        )}

        {/* Current (Last) Item */}
        {itemsCount > 1 && (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold text-foreground">
              {lastItem.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
