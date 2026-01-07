import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box, Text, Center, Loader, Stack } from '@mantine/core'
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

// Estimated height of each book card (padding + content + badges)
const ESTIMATED_ROW_HEIGHT = 90
const HEADER_HEIGHT = 48 // Fixed header height
const BOTTOM_PADDING = 60 // Bottom bar height + safe area approximation

export function BookList({
  books,
  categories,
  locations,
  searchTerm,
  onBookClick,
  isLoading,
}: BookListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const isSearching = searchTerm.length >= 3

  const virtualizer = useVirtualizer({
    count: isSearching ? 0 : (books?.length ?? 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 5,
  })

  // Loading state
  if (isLoading || books === undefined) {
    return (
      <Center
        style={{
          flex: 1,
          minHeight: 0,
          paddingTop: HEADER_HEIGHT,
        }}
      >
        <Stack align="center" gap="sm">
          <Loader size="lg" />
          <Text c="dimmed" size="sm">
            Loading books...
          </Text>
        </Stack>
      </Center>
    )
  }

  // Empty state
  if (books.length === 0) {
    return (
      <Center
        style={{
          flex: 1,
          minHeight: 0,
          paddingTop: HEADER_HEIGHT,
        }}
      >
        <Text c="dimmed" ta="center" px="md">
          {isSearching
            ? `No '${searchTerm}' book exists yet. Are you buying it?`
            : "No books here yet. Let's add some"}
        </Text>
      </Center>
    )
  }

  // Use simple list for search results (typically < 50 items)
  if (isSearching) {
    return (
      <Box
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingTop: HEADER_HEIGHT,
          paddingBottom: `calc(${BOTTOM_PADDING}px + var(--safe-area-inset-bottom))`,
        }}
      >
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            categories={categories}
            locations={locations}
            onClick={() => onBookClick(book)}
          />
        ))}
      </Box>
    )
  }

  // Use virtualized list for full book list
  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <Box
      ref={parentRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingTop: HEADER_HEIGHT,
        paddingBottom: `calc(${BOTTOM_PADDING}px + var(--safe-area-inset-bottom))`,
      }}
    >
      <Box
        style={{
          height: totalSize,
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
