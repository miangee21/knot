//convex/trash.ts
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

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

      await ctx.db.patch(itemId, { deletedAt: now });
      // Background Scheduler: Process descendants securely without blocking UI
      await ctx.scheduler.runAfter(
        0,
        internal.trash.softDeleteDescendantsBatch,
        {
          parentId: itemId,
          userId,
          deletedAt: now,
        },
      );
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

// 2. Unified Master Paginated Trash API (No Collect/Slice)
export const getTrashPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    tab: v.union(
      v.literal("item"),
      v.literal("category"),
      v.literal("location"),
    ),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    let pageDocs: Array<Doc<"items"> | Doc<"categories"> | Doc<"locations">> =
      [];
    let isDone = true;
    let continueCursor = "";

    if (args.tab === "item") {
      if (args.searchTerm) {
        const rawSearch = await ctx.db
          .query("items")
          .withSearchIndex("search_name", (q) =>
            q.search("name", args.searchTerm as string).eq("userId", userId),
          )
          .take(100);
        pageDocs = rawSearch.filter((i) => i.deletedAt !== undefined);
      } else {
        const results = await ctx.db
          .query("items")
          .withIndex("by_user_sort", (q) => q.eq("userId", userId))
          .filter((q) => q.neq(q.field("deletedAt"), undefined))
          .order("asc")
          .paginate(args.paginationOpts);
        pageDocs = results.page;
        isDone = results.isDone;
        continueCursor = results.continueCursor;
      }
    } else if (args.tab === "category") {
      if (args.searchTerm) {
        const rawSearch = await ctx.db
          .query("categories")
          .withSearchIndex("search_name", (q) =>
            q.search("name", args.searchTerm as string).eq("userId", userId),
          )
          .take(100);
        pageDocs = rawSearch.filter((i) => i.deletedAt !== undefined);
      } else {
        const results = await ctx.db
          .query("categories")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.neq(q.field("deletedAt"), undefined))
          .order("desc")
          .paginate(args.paginationOpts);
        pageDocs = results.page;
        isDone = results.isDone;
        continueCursor = results.continueCursor;
      }
    } else if (args.tab === "location") {
      if (args.searchTerm) {
        const rawSearch = await ctx.db
          .query("locations")
          .withSearchIndex("search_name", (q) =>
            q.search("name", args.searchTerm as string).eq("userId", userId),
          )
          .take(100);
        pageDocs = rawSearch.filter((i) => i.deletedAt !== undefined);
      } else {
        const results = await ctx.db
          .query("locations")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.neq(q.field("deletedAt"), undefined))
          .order("desc")
          .paginate(args.paginationOpts);
        pageDocs = results.page;
        isDone = results.isDone;
        continueCursor = results.continueCursor;
      }
    }

    const page = await Promise.all(
      pageDocs.map(async (doc) => {
        if (args.tab === "item") {
          const itemDoc = doc as Doc<"items">;
          return {
            ...itemDoc,
            type: args.tab,
            posterUrl: itemDoc.posterStorageId
              ? await ctx.storage.getUrl(itemDoc.posterStorageId)
              : undefined,
          };
        }
        return { ...doc, type: args.tab };
      }),
    );

    return { page, isDone, continueCursor };
  },
});

// Professional scalable counts for UI Tabs (Max 100 limit to prevent memory bloat)
export const getTrashCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { items: 0, categories: 0, locations: 0 };

    // Using .take(100) instead of .collect() prevents server memory crashes on large datasets.
    // The UI will naturally show up to 100, acting like a "99+" badge.
    const items = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .take(100);
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .take(100);
    const locations = await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .take(100);

    return {
      items: items.length,
      categories: categories.length,
      locations: locations.length,
    };
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

      await ctx.db.patch(itemId, { deletedAt: undefined });
      // Background Scheduler: Process descendants securely without blocking UI
      await ctx.scheduler.runAfter(0, internal.trash.restoreDescendantsBatch, {
        parentId: itemId,
        userId,
      });
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
        // Delete parent image from Convex Storage if it exists
        if (item.posterStorageId) {
          await ctx.storage.delete(item.posterStorageId);
        }

        await ctx.db.delete(itemId);
        // Background Scheduler: Securely wipe storage and docs without timeout
        await ctx.scheduler.runAfter(
          0,
          internal.trash.hardDeleteDescendantsBatch,
          {
            parentId: itemId,
            userId,
          },
        );
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

// --- BACKGROUND WORKERS (Internal Mutations for Safe Recursion) ---

export const softDeleteDescendantsBatch = internalMutation({
  args: {
    parentId: v.id("items"),
    userId: v.id("users"),
    deletedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) =>
        q.eq("parentId", args.parentId).eq("userId", args.userId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(100);

    for (const child of children) {
      await ctx.db.patch(child._id, { deletedAt: args.deletedAt });
      await ctx.scheduler.runAfter(
        0,
        internal.trash.softDeleteDescendantsBatch,
        {
          parentId: child._id,
          userId: args.userId,
          deletedAt: args.deletedAt,
        },
      );
    }

    if (children.length === 100) {
      await ctx.scheduler.runAfter(
        0,
        internal.trash.softDeleteDescendantsBatch,
        args,
      );
    }
  },
});

export const restoreDescendantsBatch = internalMutation({
  args: { parentId: v.id("items"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) =>
        q.eq("parentId", args.parentId).eq("userId", args.userId),
      )
      .filter((q) => q.neq(q.field("deletedAt"), undefined))
      .take(100);

    for (const child of children) {
      await ctx.db.patch(child._id, { deletedAt: undefined });
      await ctx.scheduler.runAfter(0, internal.trash.restoreDescendantsBatch, {
        parentId: child._id,
        userId: args.userId,
      });
    }

    if (children.length === 100) {
      await ctx.scheduler.runAfter(
        0,
        internal.trash.restoreDescendantsBatch,
        args,
      );
    }
  },
});

export const hardDeleteDescendantsBatch = internalMutation({
  args: { parentId: v.id("items"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("items")
      .withIndex("by_parent", (q) =>
        q.eq("parentId", args.parentId).eq("userId", args.userId),
      )
      .take(100);

    for (const child of children) {
      if (child.posterStorageId) {
        await ctx.storage.delete(child.posterStorageId);
      }
      await ctx.db.delete(child._id);
      await ctx.scheduler.runAfter(
        0,
        internal.trash.hardDeleteDescendantsBatch,
        {
          parentId: child._id,
          userId: args.userId,
        },
      );
    }

    if (children.length === 100) {
      await ctx.scheduler.runAfter(
        0,
        internal.trash.hardDeleteDescendantsBatch,
        args,
      );
    }
  },
});
