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
    deletedAt: v.optional(v.number()), // For Soft Delete & Recycle Bin
  }).index("by_user", ["userId"]),

  // Categories table (badge-only, not primary navigation)
  categories: defineTable({
    userId: v.id("users"),
    name: v.string(), // "Movies", "Series", "Software", "Documents"
    icon: v.string(),
    deletedAt: v.optional(v.number()), // For Soft Delete & Recycle Bin
  }).index("by_user", ["userId"]),

  // Items table (the tree — the core of the whole app)
  items: defineTable({
    userId: v.id("users"),
    parentId: v.union(v.id("items"), v.null()), // null = root level, never undefined
    name: v.string(),

    categoryId: v.optional(v.id("categories")), // Explicitly set (No automatic inheritance)
    locationIds: v.array(v.id("locations")),

    // Sequential range instead of one row per file
    rangeStart: v.optional(v.number()),
    rangeEnd: v.optional(v.number()),

    sizeBytes: v.number(),

    isFolder: v.optional(v.boolean()),
    posterStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),

    deletedAt: v.optional(v.number()), // For Soft Delete & Recycle Bin
    isAtRisk: v.optional(v.boolean()), // Write-Time Computed Flag
    sortName: v.string(), // Lowercase name for Case-Insensitive A-Z Sorting
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId", "userId"])
    .index("by_risk", ["userId", "isAtRisk"])
    .index("by_parent_sort", ["parentId", "userId", "sortName"])
    .index("by_risk_sort", ["userId", "isAtRisk", "sortName"])
    .index("by_user_sort", ["userId", "sortName"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),

  // Global App Settings (e.g., signup toggles)
  appSettings: defineTable({
    key: v.string(),
    value: v.boolean(),
  }).index("by_key", ["key"]),
});
