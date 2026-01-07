import { Group, TextInput, ActionIcon, Box } from '@mantine/core'
import { Plus, X, Search } from 'lucide-react'

interface BottomBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onAddClick: () => void
}

export function BottomBar({
  searchValue,
  onSearchChange,
  onAddClick,
}: BottomBarProps) {
  return (
    <Box
      component="footer"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
        borderTop: '1px solid var(--mantine-color-default-border)',
        paddingBottom: 'calc(var(--safe-area-inset-bottom) + 2px)',
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)',
      }}
    >
      <Group gap={8} p="sm" wrap="nowrap">
        <TextInput
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<Search size={16} />}
          rightSection={
            searchValue ? (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </ActionIcon>
            ) : null
          }
          style={{ flex: 1 }}
          styles={{
            input: {
              fontSize: 16, // Prevent iOS zoom on focus
            },
          }}
        />
        <ActionIcon
          variant="filled"
          size="lg"
          onClick={onAddClick}
          aria-label="Add book"
        >
          <Plus size={20} />
        </ActionIcon>
      </Group>
    </Box>
  )
}
