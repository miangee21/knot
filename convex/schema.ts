//convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  // --- Auth tables
  ...authTables,

  // Locations table (the drives)
  locations: defineTable({
    userId: v.id("users"),
    name: v.string(), // "Hard 1", "Cloud", "Mobile"
    kind: v.union(
      v.literal("hard"),
      v.literal("os"),
      v.literal("cloud"),
      v.literal("mobile"),
    ),
    icon: v.string(), // lucide icon name
    totalBytes: v.optional(v.number()),
    usedBytes: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Categories table (badge-only, not primary navigation)
  categories: defineTable({
    userId: v.id("users"),
    name: v.string(), // "Movies", "Series", "Software", "Documents"
    icon: v.string(),
  }).index("by_user", ["userId"]),

  // Items table (the tree — the core of the whole app)
  items: defineTable({
    userId: v.id("users"),
    parentId: v.union(v.id("items"), v.null()), // null = root level, never undefined
    name: v.string(),

    categoryId: v.optional(v.id("categories")), // unset → inherit from parent
    locationIds: v.optional(v.array(v.id("locations"))), // unset/empty → inherit

    // Sequential range instead of one row per file
    rangeStart: v.optional(v.number()),
    rangeEnd: v.optional(v.number()),

    sizeBytes: v.optional(v.number()),

    posterUrl: v.optional(v.string()),
    posterPublicId: v.optional(v.string()),

    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),
});
