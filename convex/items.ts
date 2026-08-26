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

// SECURITY HELPER: Validate ownership, types, and active status of references
async function validateReferences(ctx: any, userId: string, args: any) {
  if (args.parentId) {
    const parent = await ctx.db.get(args.parentId);
    if (!parent || parent.userId !== userId || parent.deletedAt !== undefined)
      throw new Error("Invalid or deleted parent folder");
    if (!parent.isFolder) throw new Error("Parent must be a folder");
  }
  if (args.categoryId) {
    const category = await ctx.db.get(args.categoryId);
    if (
      !category ||
      category.userId !== userId ||
      category.deletedAt !== undefined
    )
      throw new Error("Invalid or deleted category");
  }
  if (args.locationIds && args.locationIds.length > 0) {
    for (const locId of args.locationIds) {
      const location = await ctx.db.get(locId);
      if (
        !location ||
        location.userId !== userId ||
        location.deletedAt !== undefined
      )
        throw new Error("Invalid or deleted location");
    }
  }

  // SECURITY FIX: Server-side file size validation (5MB max)
  if (args.posterStorageId) {
    const file = await ctx.storage.get(args.posterStorageId);
    if (file && file.size > 5 * 1024 * 1024) {
      // 5MB in bytes
      await ctx.storage.delete(args.posterStorageId);
      throw new Error("Server Error: Image size exceeds the 5MB limit.");
    }
  }
}

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

    // Block cross-user injection and verify folder type
    await validateReferences(ctx, userId, args);

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

    // Block cross-user injection and verify folder type
    await validateReferences(ctx, userId, args);

    // BUG FIX: Delete old orphaned poster if it's being replaced or completely removed
    const newPosterId = args.posterStorageId ?? undefined;
    if (existing.posterStorageId && existing.posterStorageId !== newPosterId) {
      await ctx.storage.delete(existing.posterStorageId);
    }

    // CYCLE DETECTION: Prevent moving a folder into itself or its own subfolders
    if (args.parentId && args.parentId !== existing.parentId) {
      let currentParentId: Id<"items"> | null = args.parentId;
      while (currentParentId) {
        if (currentParentId === args.id) {
          throw new Error(
            "Folder Cycle Loop Detected: Cannot move a folder into itself.",
          );
        }
        // Strictly cast the document to avoid implicit 'any' without actually using 'any'
        const parentDoc = (await ctx.db.get(currentParentId)) as {
          parentId?: Id<"items"> | null;
        } | null;
        currentParentId = parentDoc?.parentId || null;
      }
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

// 5. Get Children of a specific Parent
export const getChildren = query({
  args: { parentId: v.union(v.id("items"), v.null()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) =>
        q.eq("parentId", args.parentId).eq("userId", userId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
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
    const visited = new Set<string>(); // CYCLE HISTORY TRACKER
    let currentId = args.itemId as Id<"items"> | null;

    while (currentId) {
      // Agar ye ID pehle visit ho chuki hai, iska matlab loop (cycle) ban gaya hai!
      if (visited.has(currentId)) {
        console.warn(
          `Infinite loop detected and prevented for item cycle at: ${currentId}`,
        );
        break;
      }
      visited.add(currentId);

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
      .withIndex("by_parent", (q) =>
        q.eq("parentId", args.parentId).eq("userId", userId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
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
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
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
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return await Promise.all(items.map((item) => withPosterUrl(ctx, item)));
  },
});

// Delete explicitly uploaded storage files (Rollback for failed DB operations)
export const deleteStorage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const linkedItem = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("posterStorageId"), args.storageId))
      .first();

    if (linkedItem) {
      if (linkedItem.userId !== userId) {
        throw new Error("Unauthorized: Storage file belongs to another user.");
      }
    } else {
    }
    await ctx.storage.delete(args.storageId);
  },
});
