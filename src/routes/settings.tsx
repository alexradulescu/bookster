import { createFileRoute, Link } from '@tanstack/react-router'
import { Title, ActionIcon, Group, Box, Tabs } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { ConfigTab } from '../components/settings/ConfigTab'
import { CategoriesTab } from '../components/settings/CategoriesTab'
import { LocationsTab } from '../components/settings/LocationsTab'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box
        component="header"
        style={{
          flexShrink: 0,
          height: 48,
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group h="100%" px="md" gap="sm">
          <ActionIcon
            component={Link}
            to="/"
            variant="light"
            color="gray"
            size="lg"
            radius="xl"
            aria-label="Back to books"
          >
            <ArrowLeft size={20} />
          </ActionIcon>
          <Title order={3} fw={600}>
            Settings
          </Title>
        </Group>
      </Box>
      <Box
        py="md"
        px="md"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxWidth: 600,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingBottom: 'calc(var(--safe-area-inset-bottom) + 16px)',
        }}
      >
        <Tabs defaultValue="config">
          <Tabs.List>
            <Tabs.Tab value="config">Config</Tabs.Tab>
            <Tabs.Tab value="categories">Categories</Tabs.Tab>
            <Tabs.Tab value="locations">Locations</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="config" pt="md">
            <ConfigTab />
          </Tabs.Panel>

          <Tabs.Panel value="categories" pt="md">
            <CategoriesTab />
          </Tabs.Panel>

          <Tabs.Panel value="locations" pt="md">
            <LocationsTab />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Box>
  )
}
