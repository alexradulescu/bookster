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
// Increased from 76 to 90 to account for books with multiple badges
const ESTIMATED_ROW_HEIGHT = 90

export function BookList({
  books,
  categories,
  locations,
  searchTerm,
  onBookClick,
  isLoading,
}: BookListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: books?.length ?? 0,
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
          maxHeight: 'calc(100vh - 120px)',
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
          maxHeight: 'calc(100vh - 120px)',
        }}
      >
        <Text c="dimmed" ta="center" px="md">
          {searchTerm.length >= 3
            ? `No '${searchTerm}' book exists yet. Are you buying it?`
            : "No books here yet. Let's add some"}
        </Text>
      </Center>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()

  // Calculate actual content height to avoid excessive scroll area
  const totalSize = virtualizer.getTotalSize()
  const bottomPadding = 60 // Bottom bar height + safe area approximation

  return (
    <Box
      ref={parentRef}
      style={{
        flex: 1,
        overflow: 'auto',
        paddingBottom: `calc(${bottomPadding}px + var(--safe-area-inset-bottom))`,
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
