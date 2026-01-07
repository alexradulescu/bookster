import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all non-deleted categories
// Note: For small datasets like categories, in-memory filtering is acceptable
export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query('categories').collect()
    return categories.filter((cat) => cat.deletedAt === undefined)
  },
})

// Get all categories including deleted ones (for data integrity)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect()
  },
})

// Create a new category
export const create = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    if (!args.label.trim()) {
      return { success: false, error: 'empty_label', message: 'Label cannot be empty' }
    }

    const categoryId = await ctx.db.insert('categories', {
      label: args.label.trim(),
    })

    return { success: true, categoryId }
  },
})

// Update a category label
export const update = mutation({
  args: {
    id: v.id('categories'),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      return { success: false, error: 'not_found', message: 'Category not found' }
    }

    if (!args.label.trim()) {
      return { success: false, error: 'empty_label', message: 'Label cannot be empty' }
    }

    await ctx.db.patch(args.id, { label: args.label.trim() })
    return { success: true }
  },
})

// Soft delete a category
export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      return { success: false, error: 'not_found', message: 'Category not found' }
    }

    await ctx.db.patch(args.id, { deletedAt: Date.now() })
    return { success: true }
  },
})
