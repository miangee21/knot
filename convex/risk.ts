//convex/risk.ts
import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
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

// Helper to get folder names for Breadcrumbs (Fast, no posters)
async function getFolderMap(ctx: QueryCtx, userId: Id<"users">) {
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
  return new Map(allFolders.map((f) => [f._id, f]));
}

// Helper to construct breadcrumb path
function buildRiskPath(
  parentId: string | null,
  folderMap: Map<Id<"items">, Doc<"items">>,
): string {
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
}

// 1. Native Database Pagination for base Risk Items (O(1) Fetch)
export const getRiskItems = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    const folderMap = await getFolderMap(ctx, userId);

    const results = await ctx.db
      .query("items")
      .withIndex("by_risk", (q) => q.eq("userId", userId).eq("isAtRisk", true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined)) // Bypass trashed items
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      results.page.map(async (item) => {
        const resolved = await withPosterUrl(ctx, item);
        return {
          ...resolved,
          effectiveLocations: item.locationIds || [],
          riskPath: buildRiskPath(item.parentId, folderMap),
        };
      }),
    );

    return { ...results, page };
  },
});

// 2. Filtered Risk Items (Flat fetch specifically for Search/Category/Location filters)
export const getFilteredRiskItems = query({
  args: {
    searchTerm: v.string(),
    categoryId: v.union(v.string(), v.null()),
    selectedLocations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const folderMap = await getFolderMap(ctx, userId);
    let files: Doc<"items">[] = [];

    // Switch between Native Search Index and Risk Index based on searchTerm
    if (args.searchTerm) {
      const searchResults = await ctx.db
        .query("items")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.searchTerm).eq("userId", userId),
        )
        .collect();
      files = searchResults.filter(
        (i) => i.isAtRisk === true && i.deletedAt === undefined,
      );
    } else {
      files = await ctx.db
        .query("items")
        .withIndex("by_risk", (q) =>
          q.eq("userId", userId).eq("isAtRisk", true),
        )
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
    }

    let vulnerableItems = files.map((item) => ({
      ...item,
      effectiveLocations: item.locationIds || [],
      riskPath: buildRiskPath(item.parentId, folderMap),
    }));

    // Apply Client-Side Filters
    if (args.categoryId) {
      vulnerableItems = vulnerableItems.filter(
        (i) => i.categoryId === args.categoryId,
      );
    }
    if (args.selectedLocations.length > 0) {
      vulnerableItems = vulnerableItems.filter((i) =>
        args.selectedLocations.some((loc) =>
          i.effectiveLocations.includes(loc as Id<"locations">),
        ),
      );
    }
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      vulnerableItems = vulnerableItems.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          (i.riskPath || "").toLowerCase().includes(term),
      );
    }

    return await Promise.all(
      vulnerableItems.map(async (item) => {
        const { effectiveLocations, riskPath, ...originalItem } = item;
        const resolved = await withPosterUrl(ctx, originalItem as Doc<"items">);
        return { ...resolved, effectiveLocations, riskPath };
      }),
    );
  },
});

// 3. Lightweight Global Count for Alert Badge
export const getRiskCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const files = await ctx.db
      .query("items")
      .withIndex("by_risk", (q) => q.eq("userId", userId).eq("isAtRisk", true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return files.length;
  },
});
