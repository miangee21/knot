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
    sizeBytes: v.optional(v.union(v.number(), v.null())),
    categoryId: v.optional(v.union(v.id("categories"), v.null())),
    locationIds: v.array(v.id("locations")),
    poster: v.optional(v.union(v.string(), v.null())), // Stores Cloudinary public_id or URL
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
      sizeBytes: args.sizeBytes ?? undefined,
      categoryId: args.categoryId ?? undefined,
      locationIds: args.locationIds,
      poster: args.poster ?? undefined,
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
    sizeBytes: v.optional(v.union(v.number(), v.null())),
    categoryId: v.optional(v.union(v.id("categories"), v.null())),
    locationIds: v.array(v.id("locations")),
    poster: v.optional(v.union(v.string(), v.null())),
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
      sizeBytes: args.sizeBytes ?? undefined,
      categoryId: args.categoryId ?? undefined,
      locationIds: args.locationIds,
      poster: args.poster ?? undefined,
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

    // Returns array from nearest to furthest root: [parent, grandparent, root]
    // The first item in the array is the item itself.
    // Usually for inheritance we slice(1) on the frontend.
    return ancestors;
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
