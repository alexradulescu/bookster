import { useState, useEffect, useRef } from 'react'
import { Group, TextInput, ActionIcon, Box } from '@mantine/core'
import { Plus, X, Search } from 'lucide-react'

const FOOTER_HEIGHT = 48

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
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const handleResize = () => {
      // Calculate keyboard height by comparing viewport height to window height
      const keyboardHeight = window.innerHeight - viewport.height
      // Only apply offset if keyboard is likely open (height > 100px)
      setKeyboardOffset(keyboardHeight > 100 ? keyboardHeight : 0)
    }

    viewport.addEventListener('resize', handleResize)
    viewport.addEventListener('scroll', handleResize)

    return () => {
      viewport.removeEventListener('resize', handleResize)
      viewport.removeEventListener('scroll', handleResize)
    }
  }, [])

  return (
    <Box
      component="footer"
      style={{
        position: 'fixed',
        bottom: keyboardOffset,
        left: 0,
        right: 0,
        zIndex: 100,
        height: FOOTER_HEIGHT,
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)',
        backgroundColor: 'var(--mantine-color-body)',
        borderTop: '1px solid var(--mantine-color-default-border)',
        transition: 'bottom 0.1s ease-out',
      }}
    >
      <Group gap={8} h={FOOTER_HEIGHT} px="sm" wrap="nowrap">
        <TextInput
          ref={inputRef}
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<Search size={16} />}
          rightSection={
            searchValue ? (
              <ActionIcon
                variant="subtle"
                size="sm"
                radius="xl"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </ActionIcon>
            ) : null
          }
          style={{ flex: 1 }}
          radius="xl"
          styles={{
            input: {
              fontSize: 16, // Prevent iOS zoom on focus
            },
          }}
        />
        <ActionIcon
          variant="filled"
          size="lg"
          radius="xl"
          onClick={onAddClick}
          aria-label="Add book"
        >
          <Plus size={20} />
        </ActionIcon>
      </Group>
    </Box>
  )
}
