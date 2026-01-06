import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mantine/core'
import { Header } from '../components/common/Header'
import { BottomBar } from '../components/common/BottomBar'
import { BookList } from '../components/book/BookList'
import { useSearchBooks } from '../hooks/useBooks'
import { useCategories } from '../hooks/useCategories'
import { useLocations } from '../hooks/useLocations'
import { useInitialization } from '../hooks/useInit'
import type { Doc } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [searchValue, setSearchValue] = useState('')
  const [_addModalOpen, setAddModalOpen] = useState(false)
  const [_selectedBook, setSelectedBook] = useState<Doc<'books'> | null>(null)

  // Initialize app (creates default locations)
  useInitialization()

  // Get data
  const books = useSearchBooks(searchValue)
  const categories = useCategories()
  const locations = useLocations()

  const handleAddClick = useCallback(() => {
    setAddModalOpen(true)
  }, [])

  const handleBookClick = useCallback((book: Doc<'books'>) => {
    setSelectedBook(book)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header />
      <BookList
        books={books}
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
      {/* AddBookModal will be added in Phase 4 */}
      {/* BookDetailModal will be added in Phase 4 */}
    </Box>
  )
}
