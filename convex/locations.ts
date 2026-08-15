//convex/locations.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getLocations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
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

export const deleteLocation = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Location not found or unauthorized");
    }

    // Note: We will add the logic to strip this location from items
    // when we build the Items Feature (Step 12). For now, it deletes the location itself.
    await ctx.db.delete(args.id);
  },
});
