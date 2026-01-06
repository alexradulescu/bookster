import { createFileRoute } from '@tanstack/react-router'
import { Container, Title, Text, Stack } from '@mantine/core'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title order={1}>Bookster</Title>
        <Text c="dimmed" ta="center">
          Your personal book library tracker
        </Text>
        <Text size="sm" c="dimmed">
          Phase 1 setup complete. Book list coming in Phase 3.
        </Text>
      </Stack>
    </Container>
  )
}
