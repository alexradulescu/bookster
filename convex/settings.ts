import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const DEFAULT_USER_ID = 'default'

// Get user settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query('settings')
      .withIndex('by_userId', (q) => q.eq('userId', DEFAULT_USER_ID))
      .first()

    // Return default settings if none exist
    if (!settings) {
      return {
        userId: DEFAULT_USER_ID,
        defaultSortOrder: 'dateAdded' as const,
        theme: 'system' as const,
      }
    }

    return settings
  },
})

// Update user settings
export const update = mutation({
  args: {
    defaultSortOrder: v.optional(
      v.union(
        v.literal('dateAdded'),
        v.literal('title'),
        v.literal('author'),
        v.literal('category'),
        v.literal('location'),
      ),
    ),
    theme: v.optional(
      v.union(v.literal('system'), v.literal('light'), v.literal('dark')),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('settings')
      .withIndex('by_userId', (q) => q.eq('userId', DEFAULT_USER_ID))
      .first()

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, {
        ...(args.defaultSortOrder !== undefined && {
          defaultSortOrder: args.defaultSortOrder,
        }),
        ...(args.theme !== undefined && { theme: args.theme }),
      })
    } else {
      // Create new settings
      await ctx.db.insert('settings', {
        userId: DEFAULT_USER_ID,
        defaultSortOrder: args.defaultSortOrder ?? 'dateAdded',
        theme: args.theme ?? 'system',
      })
    }

    return { success: true }
  },
})
