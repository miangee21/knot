//convex/locations.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

// 1. For Dropdowns & Modals (Flat List)
export const getLocations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

// 2. For Locations Page (Paginated "Load More")
export const getLocationsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    return await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const createLocation = mutation({
  args: {
    name: v.string(),
    kind: v.union(
      v.literal("hard"),
      v.literal("os"),
      v.literal("cloud"),
      v.literal("mobile"),
    ),
    icon: v.string(),
    totalBytes: v.optional(v.number()),
    usedBytes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("locations", { ...args, userId });
  },
});

export const updateLocation = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    kind: v.optional(
      v.union(
        v.literal("hard"),
        v.literal("os"),
        v.literal("cloud"),
        v.literal("mobile"),
      ),
    ),
    icon: v.optional(v.string()),
    totalBytes: v.optional(v.number()),
    usedBytes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Location not found or unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Professional DB Search (Strict Active Only)
export const searchLocations = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("locations")
      .withSearchIndex("search_name", (q) =>
        q
          .search("name", args.query)
          .eq("userId", userId)
          .eq("deletedAt", undefined),
      )
      .take(100);
  },
});
