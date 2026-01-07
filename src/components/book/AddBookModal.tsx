import { useState, useEffect } from 'react'
import {
  Modal,
  Tabs,
  TextInput,
  Switch,
  Button,
  Stack,
  Textarea,
  Select,
  Text,
  MultiSelect,
  Alert,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Info } from 'lucide-react'
import { useAddBook, useAddBulkBooks } from '../../hooks/useBooks'
import { useCategories } from '../../hooks/useCategories'
import { useLocations } from '../../hooks/useLocations'
import { parseBookCSV, getCSVTemplate } from '../../utils/csv'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

interface AddBookModalProps {
  opened: boolean
  onClose: () => void
  initialTitle?: string
}

interface SingleBookFormValues {
  title: string
  author: string
  categoryIds: string[]
  locationIds: string[]
  isSample: boolean
}

interface BulkImportFormValues {
  csvContent: string
  locationId: string
}

export function AddBookModal({
  opened,
  onClose,
  initialTitle = '',
}: AddBookModalProps) {
  const [activeTab, setActiveTab] = useState<string | null>('single')
  const [bulkPreview, setBulkPreview] = useState<{
    valid: number
    invalid: number
    errors: string[]
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const categories = useCategories()
  const locations = useLocations()
  const addBook = useAddBook()
  const addBulkBooks = useAddBulkBooks()

  // Single book form
  const singleForm = useForm<SingleBookFormValues>({
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

  // Bulk import form
  const bulkForm = useForm<BulkImportFormValues>({
    initialValues: {
      csvContent: '',
      locationId: '',
    },
  })

  // Update title when initialTitle changes (e.g., from search term)
  useEffect(() => {
    if (opened && initialTitle && !singleForm.isDirty('title')) {
      singleForm.setFieldValue('title', initialTitle)
    }
  }, [opened, initialTitle])

  // Reset forms when modal closes
  useEffect(() => {
    if (!opened) {
      singleForm.reset()
      bulkForm.reset()
      setBulkPreview(null)
    }
  }, [opened])

  const handleSingleSubmit = async (values: SingleBookFormValues) => {
    setIsProcessing(true)
    try {
      const result = await addBook({
        title: values.title.trim(),
        author: values.author.trim(),
        categoryIds: values.categoryIds as Id<'categories'>[],
        locationIds: values.locationIds as Id<'locations'>[],
        isSample: values.isSample,
      })

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `"${values.title}" has been added`,
          color: 'green',
        })
        // Clear form but keep modal open
        singleForm.reset()
      } else if (result.error === 'duplicate') {
        notifications.show({
          title: 'Duplicate',
          message: 'This book already exists in your library',
          color: 'yellow',
        })
      }
    } catch (error) {
      console.error('Failed to add book:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to add book. Please try again.',
        color: 'red',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkProcess = () => {
    const result = parseBookCSV(bulkForm.values.csvContent)
    setBulkPreview({
      valid: result.valid.length,
      invalid: result.invalid,
      errors: result.errors,
    })
  }

  const handleBulkConfirm = async () => {
    setIsProcessing(true)
    try {
      const parsed = parseBookCSV(bulkForm.values.csvContent)
      const result = await addBulkBooks({
        books: parsed.valid,
        locationId: bulkForm.values.locationId
          ? (bulkForm.values.locationId as Id<'locations'>)
          : undefined,
      })

      notifications.show({
        title: 'Import Complete',
        message: `Imported ${result.imported} books, skipped ${result.skipped} duplicates, ${result.failed} failed`,
        color: result.imported > 0 ? 'green' : 'yellow',
      })

      // Reset form
      bulkForm.reset()
      setBulkPreview(null)
    } catch (error) {
      console.error('Failed to import books:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to import books. Please try again.',
        color: 'red',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    // Check for unsaved changes
    if (singleForm.isDirty() || bulkForm.isDirty()) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return
      }
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add Book"
      size="md"
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="single">Single Book</Tabs.Tab>
          <Tabs.Tab value="bulk">Bulk CSV</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="single" pt="md">
          <form onSubmit={singleForm.onSubmit(handleSingleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="Enter book title"
                required
                autoFocus
                {...singleForm.getInputProps('title')}
                styles={{ input: { fontSize: 16 } }}
              />
              <TextInput
                label="Author"
                placeholder="Enter author name"
                required
                {...singleForm.getInputProps('author')}
                styles={{ input: { fontSize: 16 } }}
              />
              <MultiSelect
                label="Categories"
                placeholder="Select categories"
                data={categoryOptions}
                searchable
                clearable
                {...singleForm.getInputProps('categoryIds')}
              />
              <MultiSelect
                label="Locations"
                placeholder="Select locations"
                data={locationOptions}
                searchable
                clearable
                {...singleForm.getInputProps('locationIds')}
              />
              <Switch
                label="Is Sample"
                description="Mark this book as a sample/preview"
                {...singleForm.getInputProps('isSample', { type: 'checkbox' })}
              />
              <Button type="submit" loading={isProcessing} fullWidth>
                Add Book
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="bulk" pt="md">
          <Stack gap="md">
            <Alert icon={<Info size={16} />} color="blue">
              <Text size="sm">
                CSV format: title,author,isSample
                <br />
                <Button
                  variant="subtle"
                  size="compact-xs"
                  onClick={() => bulkForm.setFieldValue('csvContent', getCSVTemplate())}
                >
                  Load template
                </Button>
              </Text>
            </Alert>
            <Textarea
              label="CSV Content"
              placeholder="Paste your CSV content here..."
              minRows={6}
              {...bulkForm.getInputProps('csvContent')}
              styles={{ input: { fontSize: 16 } }}
            />
            <Select
              label="Location (optional)"
              placeholder="Select location for all books"
              data={locationOptions}
              clearable
              {...bulkForm.getInputProps('locationId')}
            />

            {bulkPreview && (
              <Alert color={bulkPreview.errors.length > 0 ? 'yellow' : 'green'}>
                <Text size="sm">
                  Ready to import {bulkPreview.valid} books
                  {bulkPreview.invalid > 0 && `, ${bulkPreview.invalid} will be skipped (missing data)`}
                </Text>
                {bulkPreview.errors.map((error, i) => (
                  <Text key={i} size="xs" c="red">
                    {error}
                  </Text>
                ))}
              </Alert>
            )}

            {!bulkPreview ? (
              <Button
                onClick={handleBulkProcess}
                disabled={!bulkForm.values.csvContent.trim()}
                fullWidth
              >
                Process CSV
              </Button>
            ) : (
              <Button
                onClick={handleBulkConfirm}
                loading={isProcessing}
                disabled={bulkPreview.valid === 0}
                fullWidth
              >
                Confirm Import ({bulkPreview.valid} books)
              </Button>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}
