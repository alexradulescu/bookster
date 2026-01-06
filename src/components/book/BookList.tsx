import { useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box, Text, Center, Loader } from '@mantine/core'
import { BookCard } from './BookCard'
import type { Doc } from '../../../convex/_generated/dataModel'

interface BookListProps {
  books: Doc<'books'>[] | undefined
  categories: Doc<'categories'>[]
  locations: Doc<'locations'>[]
  searchTerm: string
  onBookClick: (book: Doc<'books'>) => void
  isLoading?: boolean
}

// Estimated height of each book card (padding + content)
const ESTIMATED_ROW_HEIGHT = 76

export function BookList({
  books,
  categories,
  locations,
  searchTerm,
  onBookClick,
  isLoading,
}: BookListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Memoize the estimateSize function to prevent infinite re-renders
  const estimateSize = useCallback(() => ESTIMATED_ROW_HEIGHT, [])

  const virtualizer = useVirtualizer({
    count: books?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  })

  // Loading state
  if (isLoading || books === undefined) {
    return (
      <Center style={{ flex: 1 }}>
        <Loader size="lg" />
      </Center>
    )
  }

  // Empty state
  if (books.length === 0) {
    return (
      <Center style={{ flex: 1 }}>
        <Text c="dimmed" ta="center" px="md">
          {searchTerm.length >= 3
            ? `No '${searchTerm}' book exists yet. Are you buying it?`
            : "No books here yet. Let's add some"}
        </Text>
      </Center>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <Box
      ref={parentRef}
      style={{
        flex: 1,
        overflow: 'auto',
        // Account for bottom bar height (approx 60px + safe area)
        paddingBottom: 'calc(60px + var(--safe-area-inset-bottom))',
      }}
    >
      <Box
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const book = books[virtualRow.index]
          return (
            <Box
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <BookCard
                book={book}
                categories={categories}
                locations={locations}
                onClick={() => onBookClick(book)}
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
