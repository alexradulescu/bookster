import { Box, Badge } from '@mantine/core'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

interface CategoryFilterProps {
  categories: Doc<'categories'>[]
  deselectedIds: Set<Id<'categories'>>
  onToggle: (id: Id<'categories'>) => void
}

export function CategoryFilter({
  categories,
  deselectedIds,
  onToggle,
}: CategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <Box
      className="category-filter-bar"
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
        padding: '8px 12px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        flexWrap: 'nowrap',
        flexShrink: 0,
      }}
    >
      {categories.map((category) => {
        const isSelected = !deselectedIds.has(category._id)
        return (
          <Badge
            key={category._id}
            variant={isSelected ? 'filled' : 'outline'}
            color="sage"
            radius="xl"
            size="md"
            style={{
              cursor: 'pointer',
              flexShrink: 0,
              userSelect: 'none',
              transition: 'opacity 0.15s ease',
              opacity: isSelected ? 1 : 0.5,
            }}
            onClick={() => onToggle(category._id)}
          >
            {category.label}
          </Badge>
        )
      })}
    </Box>
  )
}
