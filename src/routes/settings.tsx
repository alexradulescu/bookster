import { createFileRoute, Link } from '@tanstack/react-router'
import { Title, ActionIcon, Group, Box, Tabs } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { ConfigTab } from '../components/settings/ConfigTab'
import { CategoriesTab } from '../components/settings/CategoriesTab'
import { LocationsTab } from '../components/settings/LocationsTab'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const HEADER_HEIGHT = 48

function SettingsPage() {
  return (
    <>
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
        <Group h={HEADER_HEIGHT} px="md" gap="sm">
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
          position: 'fixed',
          top: HEADER_HEIGHT,
          bottom: 0,
          left: 'var(--safe-area-inset-left)',
          right: 'var(--safe-area-inset-right)',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 16,
        }}
      >
        <Box style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
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
    </>
  )
}
