import { mutation, query } from './_generated/server'

const DEFAULT_LOCATIONS = [
  'Bookshelf',
  'Kindle',
  'Apple Books',
  'Google Books',
  'PDF',
]

// Check if initialization has been done
export const isInitialized = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query('locations').collect()
    return locations.length > 0
  },
})

// Create default locations on first run
export const createDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already initialized
    const existingLocations = await ctx.db.query('locations').collect()
    if (existingLocations.length > 0) {
      return { success: true, message: 'Already initialized', created: 0 }
    }

    // Create default locations
    for (const label of DEFAULT_LOCATIONS) {
      await ctx.db.insert('locations', {
        label,
      })
    }

    // Create default settings
    const existingSettings = await ctx.db.query('settings').collect()
    if (existingSettings.length === 0) {
      await ctx.db.insert('settings', {
        userId: 'default',
        defaultSortOrder: 'dateAdded',
        theme: 'system',
      })
    }

    return { success: true, message: 'Initialized', created: DEFAULT_LOCATIONS.length }
  },
})
