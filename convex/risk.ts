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

    // 1. Native Database Risk Filter (O(1) Fetch using new index)
    // Server pulls ONLY at-risk files using the native index. Zero load on safe files.
    const files = await ctx.db
      .query("items")
      .withIndex("by_risk", (q) => q.eq("userId", userId).eq("isAtRisk", true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined)) // Bypass trashed items
      .collect();

    // Map strongly-typed properties
    let vulnerableItems = files.map((item) => {
      return {
        ...item,
        // Strict block in trash.ts guarantees that assigned locations are active
        effectiveLocations: item.locationIds || [],
        riskPath: getRiskPath(item.parentId),
      };
    });

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
