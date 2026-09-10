//convex/categories.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

// Get all categories for the current user
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get paginated categories for the Categories Page (Load More)
export const getCategoriesPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    return await ctx.db
      .query("categories")
      .withIndex("by_user_sort", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc") // 0-9 first, then A-Z
      .paginate(args.paginationOpts);
  },
});

// Professional DB Search (Strict Active Only)
export const searchCategories = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("categories")
      .withSearchIndex("search_name", (q) =>
        q
          .search("name", args.query)
          .eq("userId", userId)
          .eq("deletedAt", undefined),
      )
      .take(100);
  },
});

// Helper for Natural Sorting (Numbers first, then A-Z)
function generateSortName(name: string): string {
  return name.toLowerCase().replace(/\d+/g, (match) => match.padStart(10, "0"));
}

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("categories", {
      ...args,
      userId,
      sortName: generateSortName(args.name),
    });
  },
});

// Update an existing category
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const { id, ...updates } = args;
    const patchData: { name?: string; icon?: string; sortName?: string } = {
      ...updates,
    };
    if (args.name !== undefined) {
      patchData.sortName = generateSortName(args.name);
    }
    await ctx.db.patch(id, patchData);
  },
});
