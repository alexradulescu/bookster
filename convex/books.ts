import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'

// Get all books
export const list = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query('books').collect()
    return books
  },
})

// Get a single book by ID
export const get = query({
  args: { id: v.id('books') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Search books by title or author
export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.term.toLowerCase()

    if (searchTerm.length < 3) {
      // Return all books if search term is less than 3 characters
      return await ctx.db.query('books').collect()
    }

    const allBooks = await ctx.db.query('books').collect()

    // Filter books matching title or author
    const matches = allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm),
    )

    // Sort by priority:
    // 1. title.startsWith(searchTerm)
    // 2. title.contains(searchTerm)
    // 3. author.contains(searchTerm)
    matches.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const aAuthor = a.author.toLowerCase()
      const bAuthor = b.author.toLowerCase()

      const aStartsWith = aTitle.startsWith(searchTerm) ? 0 : 1
      const bStartsWith = bTitle.startsWith(searchTerm) ? 0 : 1

      if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith

      const aTitleContains = aTitle.includes(searchTerm) ? 0 : 1
      const bTitleContains = bTitle.includes(searchTerm) ? 0 : 1

      if (aTitleContains !== bTitleContains)
        return aTitleContains - bTitleContains

      const aAuthorContains = aAuthor.includes(searchTerm) ? 0 : 1
      const bAuthorContains = bAuthor.includes(searchTerm) ? 0 : 1

      return aAuthorContains - bAuthorContains
    })

    return matches
  },
})

// Check if a book with the same title and author exists
async function isDuplicate(
  ctx: any,
  title: string,
  author: string,
  excludeId?: Id<'books'>,
): Promise<boolean> {
  const allBooks = await ctx.db.query('books').collect()
  return allBooks.some(
    (book: any) =>
      book._id !== excludeId &&
      book.title.toLowerCase() === title.toLowerCase() &&
      book.author.toLowerCase() === author.toLowerCase(),
  )
}

// Add a single book
export const add = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    categoryIds: v.optional(v.array(v.id('categories'))),
    locationIds: v.optional(v.array(v.id('locations'))),
    isSample: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check for duplicates
    if (await isDuplicate(ctx, args.title, args.author)) {
      return { success: false, error: 'duplicate', message: 'Book already exists' }
    }

    const now = Date.now()
    const bookId = await ctx.db.insert('books', {
      title: args.title,
      author: args.author,
      categoryIds: args.categoryIds ?? [],
      locationIds: args.locationIds ?? [],
      isSample: args.isSample ?? false,
      dateAdded: now,
      lastUpdated: now,
    })

    return { success: true, bookId }
  },
})

// Add multiple books (bulk import)
export const addBulk = mutation({
  args: {
    books: v.array(
      v.object({
        title: v.string(),
        author: v.string(),
        isSample: v.boolean(),
      }),
    ),
    locationId: v.optional(v.id('locations')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    let imported = 0
    let skipped = 0
    let failed = 0

    for (const book of args.books) {
      // Validate required fields
      if (!book.title?.trim() || !book.author?.trim()) {
        failed++
        continue
      }

      // Check for duplicates
      if (await isDuplicate(ctx, book.title, book.author)) {
        skipped++
        continue
      }

      await ctx.db.insert('books', {
        title: book.title.trim(),
        author: book.author.trim(),
        categoryIds: [],
        locationIds: args.locationId ? [args.locationId] : [],
        isSample: book.isSample ?? false,
        dateAdded: now,
        lastUpdated: now,
      })
      imported++
    }

    return { imported, skipped, failed }
  },
})

// Update a book
export const update = mutation({
  args: {
    id: v.id('books'),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id('categories'))),
    locationIds: v.optional(v.array(v.id('locations'))),
    isSample: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      return { success: false, error: 'not_found', message: 'Book not found' }
    }

    const newTitle = args.title ?? existing.title
    const newAuthor = args.author ?? existing.author

    // Check for duplicates if title or author changed
    if (
      newTitle.toLowerCase() !== existing.title.toLowerCase() ||
      newAuthor.toLowerCase() !== existing.author.toLowerCase()
    ) {
      if (await isDuplicate(ctx, newTitle, newAuthor, args.id)) {
        return { success: false, error: 'duplicate', message: 'Book already exists' }
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.author !== undefined && { author: args.author }),
      ...(args.categoryIds !== undefined && { categoryIds: args.categoryIds }),
      ...(args.locationIds !== undefined && { locationIds: args.locationIds }),
      ...(args.isSample !== undefined && { isSample: args.isSample }),
      lastUpdated: Date.now(),
    })

    return { success: true }
  },
})

// Delete a book (hard delete)
export const remove = mutation({
  args: { id: v.id('books') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      return { success: false, error: 'not_found', message: 'Book not found' }
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})
