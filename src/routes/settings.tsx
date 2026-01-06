import { createFileRoute, Link } from '@tanstack/react-router'
import { Container, Title, Text, Stack, ActionIcon, Group, Box } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        component="header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 48,
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group h="100%" px="md" gap="sm">
          <ActionIcon
            component={Link}
            to="/"
            variant="subtle"
            size="lg"
            aria-label="Back to books"
          >
            <ArrowLeft size={20} />
          </ActionIcon>
          <Title order={3} fw={600}>
            Settings
          </Title>
        </Group>
      </Box>
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Text c="dimmed" ta="center">
            Settings page will be implemented in Phase 6.
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}
