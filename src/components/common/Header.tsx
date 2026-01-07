import { Group, Title, ActionIcon, Box } from '@mantine/core'
import { Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <Box
      component="header"
      style={{
        flexShrink: 0,
        height: 48,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group h="100%" px="md" justify="space-between">
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
