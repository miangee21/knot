//convex/items.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Generate Upload URL for Convex Native Storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// 1. Create an Item
export const create = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.union(v.id("items"), v.null())),
    start: v.optional(v.union(v.number(), v.null())),
    end: v.optional(v.union(v.number(), v.null())),
    sizeBytes: v.number(),
    categoryId: v.optional(v.union(v.id("categories"), v.null())),
    locationIds: v.array(v.id("locations")),
    isFolder: v.optional(v.boolean()),
    posterStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("items", {
      userId,
      name: args.name,
      parentId: args.parentId !== undefined ? args.parentId : null,
      rangeStart: args.start ?? undefined,
      rangeEnd: args.end ?? undefined,
      sizeBytes: args.sizeBytes,
      categoryId: args.categoryId ?? undefined,
      locationIds: args.locationIds,
      isFolder: args.isFolder ?? false,
      posterStorageId: args.posterStorageId ?? undefined,
      notes: args.notes ?? undefined,
    });
  },
});

// 2. Update an Item
export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.string(),
    parentId: v.optional(v.union(v.id("items"), v.null())),
    start: v.optional(v.union(v.number(), v.null())),
    end: v.optional(v.union(v.number(), v.null())),
    sizeBytes: v.number(),
    categoryId: v.optional(v.union(v.id("categories"), v.null())),
    locationIds: v.array(v.id("locations")),
    isFolder: v.optional(v.boolean()),
    posterStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Item not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      parentId: args.parentId !== undefined ? args.parentId : null,
      rangeStart: args.start ?? undefined,
      rangeEnd: args.end ?? undefined,
      sizeBytes: args.sizeBytes,
      categoryId: args.categoryId ?? undefined,
      locationIds: args.locationIds,
      isFolder: args.isFolder ?? false,
      posterStorageId: args.posterStorageId ?? undefined,
      notes: args.notes ?? undefined,
    });
    return args.id;
  },
});

// Helper function to resolve poster URL on the fly
async function withPosterUrl(ctx: any, item: any) {
  if (!item) return item;
  return {
    ...item,
    posterUrl: item.posterStorageId
      ? await ctx.storage.getUrl(item.posterStorageId)
      : undefined,
  };
}

// 4. Get a specific Item
export const getById = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const item = await ctx.db.get(args.id);
    if (item?.userId === userId && item.deletedAt === undefined) {
      return await withPosterUrl(ctx, item);
    }
    return null;
  },
});

// 5. Get Children of a specific Parent
export const getChildren = query({
  args: { parentId: v.union(v.id("items"), v.null()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("deletedAt"), undefined),
        ),
      )
      .collect();

    return await Promise.all(items.map((item) => withPosterUrl(ctx, item)));
  },
});

// 6. Get Ancestors (Breadcrumbs / Inheritance resolution)
export const getAncestors = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const ancestors: any[] = [];
    let currentId = args.itemId as Id<"items"> | null;

    while (currentId) {
      const item = await ctx.db.get(currentId);
      if (!item || item.userId !== userId || item.deletedAt !== undefined)
        break;

      ancestors.push(await withPosterUrl(ctx, item));
      currentId = item.parentId;
    }

    return ancestors.reverse();
  },
});

// 7. Search Items
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const results = await ctx.db
      .query("items")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.query).eq("userId", userId),
      )
      .collect();

    const activeItems = results.filter((i) => i.deletedAt === undefined);
    return await Promise.all(
      activeItems.map((item) => withPosterUrl(ctx, item)),
    );
  },
});

// 8. Get stats for a specific folder
export const getFolderCounts = query({
  args: { parentId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { folders: 0, files: 0 };

    const children = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("deletedAt"), undefined),
        ),
      )
      .collect();

    return {
      folders: children.filter((c) => c.isFolder).length,
      files: children.filter((c) => !c.isFolder).length,
    };
  },
});

// 9. Get global counts for locations and categories
export const getGlobalCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { categoryCounts: {}, locationCounts: {} };

    const allItems = await ctx.db
      .query("items")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("deletedAt"), undefined),
        ),
      )
      .collect();

    const categoryCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    for (const item of allItems) {
      if (item.categoryId) {
        categoryCounts[item.categoryId] =
          (categoryCounts[item.categoryId] || 0) + 1;
      }
      for (const loc of item.locationIds) {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
    }

    return { categoryCounts, locationCounts };
  },
});

// 10. Get all items flat for Risk Analysis
export const getAllItemsFlat = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("items")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("deletedAt"), undefined),
        ),
      )
      .collect();

    return await Promise.all(items.map((item) => withPosterUrl(ctx, item)));
  },
});
