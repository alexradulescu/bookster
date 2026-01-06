import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { v4 as uuidv4 } from 'uuid'

// Get all non-deleted locations
// Note: For small datasets like locations, in-memory filtering is acceptable
export const list = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query('locations').collect()
    return locations.filter((loc) => loc.deletedAt === undefined)
  },
})

// Get all locations including deleted ones (for data integrity)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('locations').collect()
  },
})

// Create a new location
export const create = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    if (!args.label.trim()) {
      return { success: false, error: 'empty_label', message: 'Label cannot be empty' }
    }

    const locationId = await ctx.db.insert('locations', {
      id: uuidv4(),
      label: args.label.trim(),
    })

    return { success: true, locationId }
  },
})

// Update a location label
export const update = mutation({
  args: {
    id: v.id('locations'),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      return { success: false, error: 'not_found', message: 'Location not found' }
    }

    if (!args.label.trim()) {
      return { success: false, error: 'empty_label', message: 'Label cannot be empty' }
    }

    await ctx.db.patch(args.id, { label: args.label.trim() })
    return { success: true }
  },
})

// Soft delete a location
export const remove = mutation({
  args: { id: v.id('locations') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      return { success: false, error: 'not_found', message: 'Location not found' }
    }

    await ctx.db.patch(args.id, { deletedAt: Date.now() })
    return { success: true }
  },
})
