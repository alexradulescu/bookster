import { useState, useMemo } from 'react'
import {
  Stack,
  Text,
  Button,
  Table,
  ActionIcon,
  Group,
  Box,
  Modal,
  Badge,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Search, Trash2, CheckCircle } from 'lucide-react'
import { useBooks, useDeleteBook } from '../../hooks/useBooks'
import { useAllLocations } from '../../hooks/useLocations'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

type Book = Doc<'books'>

interface DuplicateGroup {
  normalizedTitle: string
  displayTitle: string
  books: Book[]
}

function findDuplicates(books: Book[]): DuplicateGroup[] {
  const groups = new Map<string, Book[]>()

  for (const book of books) {
    const normalizedTitle = book.title.toLowerCase().trim()

    if (!groups.has(normalizedTitle)) {
      groups.set(normalizedTitle, [])
    }
    groups.get(normalizedTitle)?.push(book)
  }

  // Filter to only groups with 2+ books and convert to array
  const duplicates: DuplicateGroup[] = []
  for (const [normalizedTitle, bookGroup] of groups) {
    if (bookGroup.length > 1) {
      duplicates.push({
        normalizedTitle,
        displayTitle: bookGroup[0].title,
        books: bookGroup,
      })
    }
  }

  // Sort groups alphabetically by title
  duplicates.sort((a, b) => a.normalizedTitle.localeCompare(b.normalizedTitle))

  return duplicates
}

export function DuplicatesTab() {
  const books = useBooks()
  const locations = useAllLocations()
  const deleteBook = useDeleteBook()

  const [hasChecked, setHasChecked] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const duplicates = useMemo(() => {
    if (!hasChecked || !books) return []
    return findDuplicates(books)
  }, [books, hasChecked])

  const totalDuplicateBooks = useMemo(() => {
    return duplicates.reduce((sum, group) => sum + group.books.length, 0)
  }, [duplicates])

  const locationMap = useMemo(() => {
    if (!locations) return new Map<Id<'locations'>, string>()
    return new Map(locations.map((loc) => [loc._id, loc.label]))
  }, [locations])

  const getLocationLabels = (locationIds: Id<'locations'>[]): string => {
    if (locationIds.length === 0) return '—'
    const labels = locationIds
      .map((id) => locationMap.get(id))
      .filter(Boolean)
    return labels.length > 0 ? labels.join(', ') : '—'
  }

  const handleCheck = () => {
    setIsChecking(true)
    // Simulate a brief delay for UX
    setTimeout(() => {
      setHasChecked(true)
      setIsChecking(false)
    }, 300)
  }

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteBook({ id: bookToDelete._id })
      if (result.success) {
        notifications.show({
          title: 'Book deleted',
          message: `"${bookToDelete.title}" has been removed from your library`,
          color: 'green',
        })
      } else {
        notifications.show({
          title: 'Error',
          message: result.message || 'Failed to delete book',
          color: 'red',
        })
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to delete book',
        color: 'red',
      })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setBookToDelete(null)
    }
  }

  if (!books || !locations) {
    return <Text c="dimmed">Loading...</Text>
  }

  return (
    <Stack gap="lg">
      <Text c="dimmed" size="sm">
        Check your library for books with the same title.
      </Text>

      <Button
        leftSection={<Search size={16} />}
        onClick={handleCheck}
        loading={isChecking}
        variant="light"
      >
        Check for Duplicates
      </Button>

      {hasChecked && duplicates.length === 0 && (
        <Box
          p="lg"
          style={{
            backgroundColor: 'var(--mantine-color-green-light)',
            borderRadius: 'var(--mantine-radius-md)',
          }}
        >
          <Group gap="sm">
            <CheckCircle size={24} color="var(--mantine-color-green-filled)" />
            <div>
              <Text fw={500}>No duplicates found!</Text>
              <Text size="sm" c="dimmed">
                Your library is clean.
              </Text>
            </div>
          </Group>
        </Box>
      )}

      {hasChecked && duplicates.length > 0 && (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Found {duplicates.length} duplicate group{duplicates.length !== 1 ? 's' : ''} ({totalDuplicateBooks} books)
          </Text>

          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Sample</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th style={{ width: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {duplicates.map((group) => (
                  <>
                    <Table.Tr
                      key={`group-${group.normalizedTitle}`}
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-light)',
                      }}
                    >
                      <Table.Td colSpan={5}>
                        <Text fw={600} size="sm">
                          "{group.displayTitle}" ({group.books.length} copies)
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                    {group.books.map((book) => (
                      <Table.Tr key={book._id}>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {book.title}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {book.author}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {book.isSample ? (
                            <Badge size="sm" color="yellow" variant="light">
                              Sample
                            </Badge>
                          ) : (
                            <Text size="sm" c="dimmed">
                              No
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {getLocationLabels(book.locationIds)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteClick(book)}
                            aria-label={`Delete ${book.title}`}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Stack>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Book"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete "{bookToDelete?.title}"? This action
            cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
