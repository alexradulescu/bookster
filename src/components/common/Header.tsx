import { Group, Title, ActionIcon, Box, Badge } from '@mantine/core'
import { Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

interface HeaderProps {
  categories?: Doc<'categories'>[]
  deselectedCategoryIds?: Set<Id<'categories'>>
  onToggleCategory?: (id: Id<'categories'>) => void
}

const EMPTY_SET = new Set<Id<'categories'>>()

export function Header({
  categories = [],
  deselectedCategoryIds = EMPTY_SET,
  onToggleCategory,
}: HeaderProps) {
  const showFilter = categories.length > 0

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group h={48} px="md" justify="space-between">
        <Title order={3} fw={600}>
          Bookster
        </Title>
        <ActionIcon
          component={Link}
          to="/settings"
          variant="light"
          color="gray"
          size="lg"
          radius="xl"
          aria-label="Settings"
        >
          <Settings size={20} />
        </ActionIcon>
      </Group>

      {showFilter && (
        <Box
          className="category-filter-bar"
          style={{
            padding: '6px 12px 10px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            flexWrap: 'nowrap',
          }}
        >
          {categories.map((category) => {
            const isSelected = !deselectedCategoryIds.has(category._id)
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
                onClick={() => onToggleCategory?.(category._id)}
              >
                {category.label}
              </Badge>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

