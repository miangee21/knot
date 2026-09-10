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

// 1. Unified Master Query: Professional DB Pagination + Native Search & Filters
export const getRiskItems = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    categoryId: v.optional(v.union(v.string(), v.null())),
    selectedLocations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    const folderMap = await getFolderMap(ctx, userId);
    let pageDocs: Doc<"items">[] = [];
    let isDone = true;
    let continueCursor = "";

    if (args.searchTerm) {
      // Professional Native Filtered Search
      const rawSearch = await ctx.db
        .query("items")
        .withSearchIndex("search_name", (q) => {
          let sq = q
            .search("name", args.searchTerm as string)
            .eq("userId", userId)
            .eq("deletedAt", undefined)
            .eq("isAtRisk", true);
          if (args.categoryId) {
            sq = sq.eq("categoryId", args.categoryId as Id<"categories">);
          }
          return sq;
        })
        .take(200); // Increased limit for better client-side pagination coverage

      pageDocs = rawSearch;

      if (args.selectedLocations && args.selectedLocations.length > 0) {
        pageDocs = pageDocs.filter((i) =>
          args.selectedLocations!.some((loc) =>
            i.locationIds?.includes(loc as Id<"locations">),
          ),
        );
      }
    } else {
      // Native DB Pagination with inline filters
      const results = await ctx.db
        .query("items")
        .withIndex("by_risk_sort", (q) =>
          q.eq("userId", userId).eq("isAtRisk", true),
        )
        .filter((q) => {
          const conditions = [q.eq(q.field("deletedAt"), undefined)];
          if (args.categoryId) {
            conditions.push(q.eq(q.field("categoryId"), args.categoryId));
          }
          return q.and(...conditions);
        })
        .order("asc")
        .paginate(args.paginationOpts);

      pageDocs = results.page;
      isDone = results.isDone;
      continueCursor = results.continueCursor;

      // Handle Location array filter specifically for the loaded chunk
      if (args.selectedLocations && args.selectedLocations.length > 0) {
        pageDocs = pageDocs.filter((i) =>
          args.selectedLocations!.some((loc) =>
            i.locationIds?.includes(loc as Id<"locations">),
          ),
        );
      }
    }

    const page = await Promise.all(
      pageDocs.map(async (item) => {
        const resolved = await withPosterUrl(ctx, item);
        return {
          ...resolved,
          effectiveLocations: item.locationIds || [],
          riskPath: buildRiskPath(item.parentId, folderMap),
        };
      }),
    );

    return { page, isDone, continueCursor };
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
