import { Group, Stack, Text, Badge, Box } from '@mantine/core'
import { BookCover } from './BookCover'
import type { Doc } from '../../../convex/_generated/dataModel'

interface BookCardProps {
  book: Doc<'books'>
  categories: Doc<'categories'>[]
  locations: Doc<'locations'>[]
  onClick: () => void
}

export function BookCard({
  book,
  categories,
  locations,
  onClick,
}: BookCardProps) {
  // Get category and location labels for this book
  const bookCategories = categories.filter((cat) =>
    book.categoryIds.includes(cat._id),
  )
  const bookLocations = locations.filter((loc) =>
    book.locationIds.includes(loc._id),
  )

  return (
    <Box
      onClick={onClick}
      style={{
        padding: 12,
        cursor: 'pointer',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <BookCover title={book.title} size="sm" />
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={500} lineClamp={1}>
            {book.title}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {book.author}
          </Text>
          {(bookCategories.length > 0 || bookLocations.length > 0) && (
            <Group gap={4} wrap="wrap">
              {bookCategories.map((cat) => (
                <Badge
                  key={cat._id}
                  size="xs"
                  variant="light"
                  color="cyan"
                >
                  {cat.label}
                </Badge>
              ))}
              {bookLocations.map((loc) => (
                <Badge
                  key={loc._id}
                  size="xs"
                  variant="light"
                  color="lime"
                >
                  {loc.label}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Group>
    </Box>
  )
}
