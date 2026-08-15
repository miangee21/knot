//convex/appSettings.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    return !!user?.email && user.email === process.env.ADMIN_EMAIL;
  },
});

export const getSignupEnabled = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "signupEnabled"))
      .first();
    return setting?.value ?? true; // Default is true (open)
  },
});

export const setSignupEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user?.email || user.email !== process.env.ADMIN_EMAIL) {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "signupEnabled"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.enabled });
    } else {
      await ctx.db.insert("appSettings", {
        key: "signupEnabled",
        value: args.enabled,
      });
    }
  },
});
