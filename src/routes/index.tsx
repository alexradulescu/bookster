import { useState, useCallback, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mantine/core'
import { Header } from '../components/common/Header'
import { BottomBar } from '../components/common/BottomBar'
import { BookList } from '../components/book/BookList'
import { AddBookModal } from '../components/book/AddBookModal'
import { BookDetailModal } from '../components/book/BookDetailModal'
import { useSearchBooks } from '../hooks/useBooks'
import { useCategories } from '../hooks/useCategories'
import { useLocations } from '../hooks/useLocations'
import { useSettings } from '../hooks/useSettings'
import { useInitialization } from '../hooks/useInit'
import { useSearch } from '../hooks/useSearch'
import type { Doc } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type SortOrder = 'dateAdded' | 'title' | 'author' | 'category' | 'location'

function sortBooks(
  books: Doc<'books'>[],
  sortOrder: SortOrder,
  categories: Doc<'categories'>[],
  locations: Doc<'locations'>[],
): Doc<'books'>[] {
  const sorted = [...books]

  switch (sortOrder) {
    case 'dateAdded':
      // Latest first
      sorted.sort((a, b) => b.dateAdded - a.dateAdded)
      break
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'author':
      sorted.sort((a, b) => a.author.localeCompare(b.author))
      break
    case 'category': {
      // Sort by first category label
      const getCategoryLabel = (book: Doc<'books'>) => {
        if (book.categoryIds.length === 0) return 'zzz' // Put uncategorized at end
        const cat = categories.find((c) => c._id === book.categoryIds[0])
        return cat?.label ?? 'zzz'
      }
      sorted.sort((a, b) =>
        getCategoryLabel(a).localeCompare(getCategoryLabel(b)),
      )
      break
    }
    case 'location': {
      // Sort by first location label
      const getLocationLabel = (book: Doc<'books'>) => {
        if (book.locationIds.length === 0) return 'zzz' // Put unlabeled at end
        const loc = locations.find((l) => l._id === book.locationIds[0])
        return loc?.label ?? 'zzz'
      }
      sorted.sort((a, b) =>
        getLocationLabel(a).localeCompare(getLocationLabel(b)),
      )
      break
    }
  }

  return sorted
}

function HomePage() {
  const { searchValue, setSearchValue, debouncedSearchTerm, clearSearch } =
    useSearch({ debounceMs: 150, minLength: 3 })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Doc<'books'> | null>(null)

  // Initialize app (creates default locations)
  useInitialization()

  // Get data
  const books = useSearchBooks(debouncedSearchTerm)
  const categories = useCategories()
  const locations = useLocations()
  const settings = useSettings()

  // Sort books based on settings (only when not searching)
  const sortedBooks = useMemo(() => {
    if (!books) return undefined
    // When searching, the search results are already sorted by relevance
    if (debouncedSearchTerm.length >= 3) return books
    // Otherwise, sort by user preference
    const sortOrder = settings?.defaultSortOrder ?? 'dateAdded'
    return sortBooks(books, sortOrder, categories ?? [], locations ?? [])
  }, [books, debouncedSearchTerm, settings?.defaultSortOrder, categories, locations])

  const handleAddClick = useCallback(() => {
    setAddModalOpen(true)
  }, [])

  const handleAddModalClose = useCallback(() => {
    setAddModalOpen(false)
    // Clear search when modal closes per spec
    clearSearch()
  }, [clearSearch])

  const handleBookClick = useCallback(
    (book: Doc<'books'>) => {
      setSelectedBook(book)
      // Clear search when modal opens per spec
      clearSearch()
    },
    [clearSearch],
  )

  const handleDetailModalClose = useCallback(() => {
    setSelectedBook(null)
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
    },
    [setSearchValue],
  )

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Header />
      <BookList
        books={sortedBooks}
        categories={categories ?? []}
        locations={locations ?? []}
        searchTerm={searchValue}
        onBookClick={handleBookClick}
        isLoading={books === undefined}
      />
      <BottomBar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />
      <AddBookModal
        opened={addModalOpen}
        onClose={handleAddModalClose}
        initialTitle={searchValue.length >= 3 ? searchValue : ''}
      />
      <BookDetailModal
        book={selectedBook}
        opened={selectedBook !== null}
        onClose={handleDetailModalClose}
      />
    </Box>
  )
}
