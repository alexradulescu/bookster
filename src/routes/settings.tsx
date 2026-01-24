import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Title, ActionIcon, Group, Box, SegmentedControl } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { ConfigTab } from '../components/settings/ConfigTab'
import { CategoriesTab } from '../components/settings/CategoriesTab'
import { LocationsTab } from '../components/settings/LocationsTab'
import { DuplicatesTab } from '../components/settings/DuplicatesTab'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('config')

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
          overflow: 'auto',
          maxWidth: 600,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          fullWidth
          data={[
            { label: 'Config', value: 'config' },
            { label: 'Categories', value: 'categories' },
            { label: 'Locations', value: 'locations' },
            { label: 'Duplicates', value: 'duplicates' },
          ]}
          style={{ marginBottom: 16 }}
        />

        {activeTab === 'config' && <ConfigTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'locations' && <LocationsTab />}
        {activeTab === 'duplicates' && <DuplicatesTab />}
      </Box>
    </Box>
  )
}
