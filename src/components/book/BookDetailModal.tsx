import { useState, useEffect, useRef } from 'react'
import {
  Modal,
  TextInput,
  Switch,
  Button,
  Stack,
  Group,
  Text,
  MultiSelect,
  Box,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { BookCover } from './BookCover'
import { useUpdateBook, useDeleteBook } from '../../hooks/useBooks'
import { useCategories } from '../../hooks/useCategories'
import { useLocations } from '../../hooks/useLocations'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

interface BookDetailModalProps {
  book: Doc<'books'> | null
  opened: boolean
  onClose: () => void
}

interface FormValues {
  title: string
  author: string
  categoryIds: string[]
  locationIds: string[]
  isSample: boolean
}

export function BookDetailModal({
  book,
  opened,
  onClose,
}: BookDetailModalProps) {
  const [deleteState, setDeleteState] = useState<'initial' | 'confirm'>(
    'initial',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteTimeoutRef = useRef<number | null>(null)

  const categories = useCategories()
  const locations = useLocations()
  const updateBook = useUpdateBook()
  const deleteBook = useDeleteBook()

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      author: '',
      categoryIds: [],
      locationIds: [],
      isSample: false,
    },
    validate: {
      title: (value) => (!value.trim() ? 'Title is required' : null),
      author: (value) => (!value.trim() ? 'Author is required' : null),
    },
  })

  // Reset form when book changes
  useEffect(() => {
    if (book) {
      form.setValues({
        title: book.title,
        author: book.author,
        categoryIds: book.categoryIds as string[],
        locationIds: book.locationIds as string[],
        isSample: book.isSample,
      })
      form.resetDirty()
    }
  }, [book?._id])

  // Cleanup delete timeout
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (values: FormValues) => {
    if (!book) return

    setIsSubmitting(true)
    try {
      const result = await updateBook({
        id: book._id,
        title: values.title.trim(),
        author: values.author.trim(),
        categoryIds: values.categoryIds as Id<'categories'>[],
        locationIds: values.locationIds as Id<'locations'>[],
        isSample: values.isSample,
      })

      if (result.success) {
        notifications.show({
          title: 'Saved',
          message: 'Book has been updated',
          color: 'green',
        })
        form.resetDirty()
      } else if (result.error === 'duplicate') {
        notifications.show({
          title: 'Duplicate',
          message: 'A book with this title and author already exists',
          color: 'yellow',
        })
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update book. Please try again.',
        color: 'red',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    if (deleteState === 'initial') {
      setDeleteState('confirm')
      // Reset after 10 seconds
      deleteTimeoutRef.current = window.setTimeout(() => {
        setDeleteState('initial')
      }, 10000)
    } else {
      handleDelete()
    }
  }

  const handleDelete = async () => {
    if (!book) return

    setIsDeleting(true)
    try {
      const result = await deleteBook({ id: book._id })

      if (result.success) {
        notifications.show({
          title: 'Deleted',
          message: 'Book has been removed',
          color: 'green',
        })
        onClose()
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete book. Please try again.',
        color: 'red',
      })
    } finally {
      setIsDeleting(false)
      setDeleteState('initial')
    }
  }

  const handleClose = () => {
    if (form.isDirty()) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return
      }
    }
    setDeleteState('initial')
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current)
    }
    onClose()
  }

  const categoryOptions = (categories ?? []).map((cat: Doc<'categories'>) => ({
    value: cat._id,
    label: cat.label,
  }))

  const locationOptions = (locations ?? []).map((loc: Doc<'locations'>) => ({
    value: loc._id,
    label: loc.label,
  }))

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!book) return null

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Book Details"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group align="flex-start" gap="md" wrap="nowrap">
          <BookCover title={form.values.title || book.title} size="lg" />
          <Stack gap="md" style={{ flex: 1 }}>
            <TextInput
              label="Title"
              placeholder="Enter book title"
              required
              {...form.getInputProps('title')}
              styles={{ input: { fontSize: 16 } }}
            />
            <TextInput
              label="Author"
              placeholder="Enter author name"
              required
              {...form.getInputProps('author')}
              styles={{ input: { fontSize: 16 } }}
            />
          </Stack>
        </Group>

        <Stack gap="md" mt="md">
          <MultiSelect
            label="Categories"
            placeholder="Select categories"
            data={categoryOptions}
            searchable
            clearable
            {...form.getInputProps('categoryIds')}
          />
          <MultiSelect
            label="Locations"
            placeholder="Select locations"
            data={locationOptions}
            searchable
            clearable
            {...form.getInputProps('locationIds')}
          />
          <Switch
            label="Is Sample"
            description="Mark this book as a sample/preview"
            {...form.getInputProps('isSample', { type: 'checkbox' })}
          />

          <Box>
            <Text size="sm" c="dimmed">
              Date Added: {formatDate(book.dateAdded)}
            </Text>
            <Text size="sm" c="dimmed">
              Last Updated: {formatDate(book.lastUpdated)}
            </Text>
          </Box>

          <Group gap="sm">
            <Button
              type="submit"
              loading={isSubmitting}
              style={{ flex: 1 }}
            >
              Save
            </Button>
            <Button
              variant={deleteState === 'initial' ? 'outline' : 'filled'}
              color="red"
              onClick={handleDeleteClick}
              loading={isDeleting}
            >
              {deleteState === 'initial' ? 'Delete' : 'Are you sure?'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
