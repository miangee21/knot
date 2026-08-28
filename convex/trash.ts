//convex/trash.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// 1. Move to Bin (Soft Delete)
export const moveToBin = mutation({
  args: {
    id: v.string(),
    type: v.union(
      v.literal("item"),
      v.literal("category"),
      v.literal("location"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    if (args.type === "item") {
      const itemId = ctx.db.normalizeId("items", args.id);
      if (!itemId) throw new Error("Invalid ID");

      const item = await ctx.db.get(itemId);
      if (!item || item.userId !== userId) throw new Error("Not found");

      // Cascade Soft-Delete for folders
      const softDeleteDescendants = async (parentId: Id<"items">) => {
        const children = await ctx.db
          .query("items")
          .withIndex("by_parent", (q) =>
            q.eq("parentId", parentId).eq("userId", userId),
          )
          .collect();

        for (const child of children) {
          if (child.deletedAt === undefined) {
            await ctx.db.patch(child._id, { deletedAt: now });
            await softDeleteDescendants(child._id); // Recursive
          }
        }
      };

      await ctx.db.patch(itemId, { deletedAt: now });
      await softDeleteDescendants(itemId);
    } else if (args.type === "category") {
      const catId = ctx.db.normalizeId("categories", args.id);
      if (!catId) return;
      const category = await ctx.db.get(catId);
      if (!category || category.userId !== userId)
        throw new Error("Unauthorized");
      await ctx.db.patch(catId, { deletedAt: now });
    } else if (args.type === "location") {
      const locId = ctx.db.normalizeId("locations", args.id);
      if (!locId) return;
      const location = await ctx.db.get(locId);
      if (!location || location.userId !== userId)
        throw new Error("Unauthorized");
      if (locId) {
        // STRICT BLOCK: Check if any active items are using this location
        const activeItems = await ctx.db
          .query("items")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .collect();

        const hasDependencies = activeItems.some((item) =>
          item.locationIds.includes(locId),
        );

        if (hasDependencies) {
          throw new Error("LOCATION_HAS_ITEMS");
        }

        await ctx.db.patch(locId, { deletedAt: now });
      }
    }
  },
});

// 2a. Get Trashed Items Paginated
export const getTrashItems = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      results.page.map(async (item) => ({
        ...item,
        posterUrl: item.posterStorageId
          ? await ctx.storage.getUrl(item.posterStorageId)
          : undefined,
      })),
    );

    return { ...results, page };
  },
});

// 2b. Get Trashed Categories and Locations (Flat)
export const getTrashAssets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { categories: [], locations: [] };

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();

    const locations = await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();

    return { categories, locations };
  },
});

// 3. Restore from Bin
export const restore = mutation({
  args: {
    id: v.string(),
    type: v.union(
      v.literal("item"),
      v.literal("category"),
      v.literal("location"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.type === "item") {
      const itemId = ctx.db.normalizeId("items", args.id);
      if (!itemId) return;

      const item = await ctx.db.get(itemId);
      if (!item || item.userId !== userId) return;

      // Restore parent if it was also deleted (to prevent orphaned items)
      let currentParentId = item.parentId;
      while (currentParentId) {
        const parent = await ctx.db.get(currentParentId);
        if (parent && parent.deletedAt !== undefined) {
          await ctx.db.patch(currentParentId, { deletedAt: undefined });
        }
        currentParentId = parent?.parentId || null;
      }

      // CASCADE RESTORE FOR DESCENDANTS
      const restoreDescendants = async (parentId: Id<"items">) => {
        const children = await ctx.db
          .query("items")
          .withIndex("by_parent", (q) =>
            q.eq("parentId", parentId).eq("userId", userId),
          )
          .collect();

        for (const child of children) {
          if (child.deletedAt !== undefined) {
            await ctx.db.patch(child._id, { deletedAt: undefined });
            await restoreDescendants(child._id); // Recursive
          }
        }
      };

      await ctx.db.patch(itemId, { deletedAt: undefined });
      await restoreDescendants(itemId);
    } else if (args.type === "category") {
      const catId = ctx.db.normalizeId("categories", args.id);
      if (!catId) return;
      const category = await ctx.db.get(catId);
      if (!category || category.userId !== userId)
        throw new Error("Unauthorized");
      await ctx.db.patch(catId, { deletedAt: undefined });
    } else if (args.type === "location") {
      const locId = ctx.db.normalizeId("locations", args.id);
      if (!locId) return;
      const location = await ctx.db.get(locId);
      if (!location || location.userId !== userId)
        throw new Error("Unauthorized");
      await ctx.db.patch(locId, { deletedAt: undefined });
    }
  },
});

// 4. Permanent Hard Delete (Empty Bin / Auto-Delete)
export const hardDelete = mutation({
  args: {
    id: v.string(),
    type: v.union(
      v.literal("item"),
      v.literal("category"),
      v.literal("location"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.type === "item") {
      const itemId = ctx.db.normalizeId("items", args.id);
      if (!itemId) return;
      const item = await ctx.db.get(itemId);

      // SECURITY FIX: Only allow hard delete if the item is already in trash
      if (!item || item.userId !== userId || item.deletedAt === undefined) {
        throw new Error("Item must be moved to bin before hard deletion.");
      }

      if (item && item.userId === userId) {
        // CASCADE HARD-DELETE FOR DESCENDANTS
        const hardDeleteDescendants = async (parentId: Id<"items">) => {
          const children = await ctx.db
            .query("items")
            .withIndex("by_parent", (q) =>
              q.eq("parentId", parentId).eq("userId", userId),
            )
            .collect();

          for (const child of children) {
            if (child.posterStorageId) {
              await ctx.storage.delete(child.posterStorageId);
            }
            await ctx.db.delete(child._id);
            await hardDeleteDescendants(child._id); // Recursive call
          }
        };

        // Delete parent image from Convex Storage if it exists
        if (item.posterStorageId) {
          await ctx.storage.delete(item.posterStorageId);
        }

        await ctx.db.delete(itemId);
        await hardDeleteDescendants(itemId);
      }
    } else if (args.type === "category") {
      const catId = ctx.db.normalizeId("categories", args.id);
      if (!catId) return;
      const category = await ctx.db.get(catId);

      // SECURITY FIX
      if (
        !category ||
        category.userId !== userId ||
        category.deletedAt === undefined
      )
        throw new Error("Category must be moved to bin before hard deletion.");

      // Remove category reference from items
      const linkedItems = await ctx.db
        .query("items")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("categoryId"), catId))
        .collect();
      for (const i of linkedItems) {
        await ctx.db.patch(i._id, { categoryId: undefined });
      }
      await ctx.db.delete(catId);
    } else if (args.type === "location") {
      const locId = ctx.db.normalizeId("locations", args.id);
      if (!locId) return;
      const location = await ctx.db.get(locId);

      // SECURITY FIX
      if (
        !location ||
        location.userId !== userId ||
        location.deletedAt === undefined
      )
        throw new Error("Location must be moved to bin before hard deletion.");

      await ctx.db.delete(locId);
    }
  },
});

// 5. Empty Entire Recycle Bin
export const emptyBin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete Items & Storage
    const items = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .collect();

    for (const item of items) {
      if (item.posterStorageId) {
        await ctx.storage.delete(item.posterStorageId);
      }
      await ctx.db.delete(item._id);
    }

    // Delete Categories & Unlink
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .collect();

    for (const cat of categories) {
      const linkedItems = await ctx.db
        .query("items")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("categoryId"), cat._id))
        .collect();
      for (const i of linkedItems) {
        await ctx.db.patch(i._id, { categoryId: undefined });
      }
      await ctx.db.delete(cat._id);
    }

    // Delete Locations
    const locations = await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .collect();

    for (const loc of locations) {
      await ctx.db.delete(loc._id);
    }
  },
});
