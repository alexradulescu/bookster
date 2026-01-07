import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  books: defineTable({
    title: v.string(),
    author: v.string(),
    categoryIds: v.array(v.id('categories')),
    locationIds: v.array(v.id('locations')),
    isSample: v.boolean(),
    dateAdded: v.number(),
    lastUpdated: v.number(),
  })
    .index('by_title', ['title'])
    .index('by_author', ['author'])
    .index('by_dateAdded', ['dateAdded']),

  categories: defineTable({
    label: v.string(),
    deletedAt: v.optional(v.number()),
  }).index('by_deletedAt', ['deletedAt']),

  locations: defineTable({
    label: v.string(),
    deletedAt: v.optional(v.number()),
  }).index('by_deletedAt', ['deletedAt']),

  settings: defineTable({
    userId: v.string(),
    defaultSortOrder: v.union(
      v.literal('dateAdded'),
      v.literal('title'),
      v.literal('author'),
      v.literal('category'),
      v.literal('location'),
    ),
    theme: v.union(v.literal('system'), v.literal('light'), v.literal('dark')),
  }).index('by_userId', ['userId']),
})
