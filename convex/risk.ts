//convex/risk.ts
import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id, Doc } from "./_generated/dataModel";
import { ItemDoc } from "../src/features/items/types";

// Helper function to resolve poster URL on the fly
async function withPosterUrl(
  ctx: QueryCtx,
  item: Doc<"items">,
): Promise<ItemDoc | null> {
  if (!item) return null;
  return {
    ...item,
    posterUrl: item.posterStorageId
      ? ((await ctx.storage.getUrl(item.posterStorageId)) ?? undefined)
      : undefined,
  } as unknown as ItemDoc;
}

// 1. Get Risk Items (Custom Server-Side Pagination & Filtering)
export const getRiskItemsPaginated = query({
  args: {
    currentPage: v.number(),
    itemsPerPage: v.union(v.number(), v.literal("all")),
    searchTerm: v.string(),
    categoryId: v.union(v.string(), v.null()),
    selectedLocations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { items: [], totalCount: 0 };

    // Get active locations
    const activeLocations = await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
    const activeLocationIds = activeLocations.map((l) => l._id);

    // Fetch folder names for Breadcrumbs (Fast, no posters)
    const allFolders = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("isFolder"), true),
        ),
      )
      .collect();
    const folderMap = new Map(allFolders.map((f) => [f._id, f]));

    const getRiskPath = (parentId?: string | null): string => {
      const path = [];
      let currentId = parentId;
      while (currentId) {
        const parent = folderMap.get(currentId as Id<"items">);
        if (parent) {
          path.unshift(parent.name);
          currentId = parent.parentId;
        } else break;
      }
      return ["Home", ...path].join(" > ");
    };

    // Fetch active files only
    const files = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("isFolder"), false),
        ),
      )
      .collect();

    // 1. Initial Risk Filter (Map first to add strongly-typed properties, then filter)
    const mappedFiles = files.map((item) => {
      const effectiveLocations = (item.locationIds || []).filter((locId) =>
        activeLocationIds.includes(locId as Id<"locations">),
      );
      return {
        ...item,
        effectiveLocations,
        riskPath: getRiskPath(item.parentId),
      };
    });

    let vulnerableItems = mappedFiles.filter(
      (item) => item.effectiveLocations.length === 1,
    );

    // 2. Apply Dynamic Search & Filters on Server
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      vulnerableItems = vulnerableItems.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.riskPath || "").toLowerCase().includes(term),
      );
    }
    if (args.categoryId) {
      vulnerableItems = vulnerableItems.filter(
        (item) => item.categoryId === args.categoryId,
      );
    }
    if (args.selectedLocations.length > 0) {
      vulnerableItems = vulnerableItems.filter((item) =>
        args.selectedLocations.some((loc) =>
          item.effectiveLocations.includes(loc as Id<"locations">),
        ),
      );
    }

    const totalCount = vulnerableItems.length;

    // 3. Apply Custom Server Pagination
    if (args.itemsPerPage !== "all") {
      const startIndex = (args.currentPage - 1) * args.itemsPerPage;
      vulnerableItems = vulnerableItems.slice(
        startIndex,
        startIndex + args.itemsPerPage,
      );
    }

    // 4. Resolve Image Posters ONLY for the requested items
    const paginatedItems = await Promise.all(
      vulnerableItems.map(async (item) => {
        // Safely extract the dynamically added fields before passing to the strict helper
        const { effectiveLocations, riskPath, ...originalItem } = item;
        const resolved = await withPosterUrl(ctx, originalItem as Doc<"items">);
        return {
          ...resolved,
          effectiveLocations,
          riskPath,
        };
      }),
    );

    return { items: paginatedItems, totalCount };
  },
});
