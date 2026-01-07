import { Group, Title, ActionIcon, Box } from '@mantine/core'
import { Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const HEADER_HEIGHT = 48

export function Header() {
  return (
    <Box
      component="header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: HEADER_HEIGHT,
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)',
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group h={HEADER_HEIGHT} px="md" justify="space-between">
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
    </Box>
  )
}
