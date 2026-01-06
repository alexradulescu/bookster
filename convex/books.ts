import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id, Doc } from './_generated/dataModel'
import type { QueryCtx, MutationCtx } from './_generated/server'

// Get all books sorted by dateAdded (latest first)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('books')
      .withIndex('by_dateAdded')
      .order('desc')
      .collect()
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
// Note: For large datasets (1000+ books), consider using Convex search indexes
export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.term.toLowerCase().trim()

    // Return all books sorted by dateAdded if search term is less than 3 characters
    if (searchTerm.length < 3) {
      return await ctx.db
        .query('books')
        .withIndex('by_dateAdded')
        .order('desc')
        .collect()
    }

    // For search, we need to load and filter since Convex doesn't support
    // case-insensitive partial matching on regular indexes
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

      const aStartsWith = aTitle.startsWith(searchTerm) ? 0 : 1
      const bStartsWith = bTitle.startsWith(searchTerm) ? 0 : 1

      if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith

      const aTitleContains = aTitle.includes(searchTerm) ? 0 : 1
      const bTitleContains = bTitle.includes(searchTerm) ? 0 : 1

      if (aTitleContains !== bTitleContains)
        return aTitleContains - bTitleContains

      const aAuthorContains = a.author.toLowerCase().includes(searchTerm) ? 0 : 1
      const bAuthorContains = b.author.toLowerCase().includes(searchTerm) ? 0 : 1

      return aAuthorContains - bAuthorContains
    })

    return matches
  },
})

// Check if a book with the same title and author exists
async function isDuplicate(
  ctx: QueryCtx | MutationCtx,
  title: string,
  author: string,
  excludeId?: Id<'books'>,
): Promise<boolean> {
  const normalizedTitle = title.toLowerCase().trim()
  const normalizedAuthor = author.toLowerCase().trim()

  // Use title index to narrow down results, then filter by author
  const booksWithTitle = await ctx.db
    .query('books')
    .withIndex('by_title')
    .collect()

  return booksWithTitle.some(
    (book: Doc<'books'>) =>
      book._id !== excludeId &&
      book.title.toLowerCase().trim() === normalizedTitle &&
      book.author.toLowerCase().trim() === normalizedAuthor,
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
      title: args.title.trim(),
      author: args.author.trim(),
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

    // Pre-fetch all books for duplicate checking (more efficient for bulk)
    const existingBooks = await ctx.db.query('books').collect()
    const existingSet = new Set(
      existingBooks.map(
        (b) => `${b.title.toLowerCase().trim()}|${b.author.toLowerCase().trim()}`,
      ),
    )

    for (const book of args.books) {
      // Validate required fields
      if (!book.title?.trim() || !book.author?.trim()) {
        failed++
        continue
      }

      const key = `${book.title.toLowerCase().trim()}|${book.author.toLowerCase().trim()}`

      // Check for duplicates (including ones we just added)
      if (existingSet.has(key)) {
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

      // Add to set to prevent duplicates within the same batch
      existingSet.add(key)
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
      newTitle.toLowerCase().trim() !== existing.title.toLowerCase().trim() ||
      newAuthor.toLowerCase().trim() !== existing.author.toLowerCase().trim()
    ) {
      if (await isDuplicate(ctx, newTitle, newAuthor, args.id)) {
        return { success: false, error: 'duplicate', message: 'Book already exists' }
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title.trim() }),
      ...(args.author !== undefined && { author: args.author.trim() }),
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
