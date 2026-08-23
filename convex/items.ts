//convex/items.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

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
    poster: v.optional(v.union(v.string(), v.null())),
    posterPublicId: v.optional(v.union(v.string(), v.null())),
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
      poster: args.poster ?? undefined,
      posterPublicId: args.posterPublicId ?? undefined,
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
    poster: v.optional(v.union(v.string(), v.null())),
    posterPublicId: v.optional(v.union(v.string(), v.null())),
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
      poster: args.poster ?? undefined,
      posterPublicId: args.posterPublicId ?? undefined,
      notes: args.notes ?? undefined,
    });
    return args.id;
  },
});

// 3. Remove an Item (and cascade delete its children)
export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Item not found or unauthorized");
    }

    // Helper to recursively find all descendants
    const getAllDescendants = async (
      parentId: Id<"items">,
    ): Promise<Id<"items">[]> => {
      const children = await ctx.db
        .query("items")
        .withIndex("by_parent", (q) => q.eq("parentId", parentId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();

      let descendants = children.map((c) => c._id);
      for (const child of children) {
        descendants = descendants.concat(await getAllDescendants(child._id));
      }
      return descendants;
    };

    const descendantsToDelete = await getAllDescendants(args.id);

    // Delete all descendants first
    for (const childId of descendantsToDelete) {
      await ctx.db.delete(childId);
      // NOTE: If you are storing Cloudinary publicIds in 'poster',
      // you will handle the Cloudinary API deletion from the frontend
      // BEFORE calling this mutation, or implement a backend hook/action.
    }

    // Delete the parent item
    await ctx.db.delete(args.id);
    return true;
  },
});

// 4. Get a specific Item
export const getById = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const item = await ctx.db.get(args.id);
    return item?.userId === userId ? item : null;
  },
});

// 5. Get Children of a specific Parent (or Root items if parentId is null)
export const getChildren = query({
  args: { parentId: v.union(v.id("items"), v.null()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("items")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
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

    // Walk up the tree until root
    while (currentId) {
      const item = await ctx.db.get(currentId);
      if (!item || item.userId !== userId) break;

      ancestors.push(item);
      currentId = item.parentId;
    }

    // Reverse it so frontend gets it from root to current item: [root, grandparent, parent, item]
    return ancestors.reverse();
  },
});

// 7. Search Items (Professional Convex Search Index)
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("items")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.query).eq("userId", userId),
      )
      .collect();
  },
});

// 8. Helper to get all poster URLs for an item and its descendants before deletion
export const getPostersForDeletion = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const publicIds: string[] = [];
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) return [];

    if (item.posterPublicId) publicIds.push(item.posterPublicId);

    const getAllDescendants = async (parentId: Id<"items">) => {
      const children = await ctx.db
        .query("items")
        .withIndex("by_parent", (q) => q.eq("parentId", parentId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();

      for (const child of children) {
        if (child.posterPublicId) publicIds.push(child.posterPublicId);
        await getAllDescendants(child._id);
      }
    };

    await getAllDescendants(args.id);
    return publicIds;
  },
});

// 9. Get stats for a specific folder
export const getFolderCounts = query({
  args: { parentId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { folders: 0, files: 0 };

    const children = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return {
      folders: children.filter((c) => c.isFolder).length,
      files: children.filter((c) => !c.isFolder).length,
    };
  },
});

// 10. Get global counts for locations and categories
export const getGlobalCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { categoryCounts: {}, locationCounts: {} };

    const allItems = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("userId"), userId))
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
