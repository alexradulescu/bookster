import { Select, Stack, Text } from '@mantine/core'
import { useMantineColorScheme } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'

const SORT_OPTIONS = [
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'category', label: 'Category' },
  { value: 'location', label: 'Location' },
]

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function ConfigTab() {
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const { setColorScheme } = useMantineColorScheme()

  const handleSortChange = async (value: string | null) => {
    if (!value) return

    try {
      await updateSettings({
        defaultSortOrder: value as
          | 'dateAdded'
          | 'title'
          | 'author'
          | 'category'
          | 'location',
      })
      notifications.show({
        title: 'Saved',
        message: 'Default sort order updated',
        color: 'green',
      })
    } catch (error) {
      console.error('Failed to update sort order:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to update settings',
        color: 'red',
      })
    }
  }

  const handleThemeChange = async (value: string | null) => {
    if (!value) return

    const theme = value as 'system' | 'light' | 'dark'

    // Update Mantine color scheme
    setColorScheme(theme === 'system' ? 'auto' : theme)

    try {
      await updateSettings({ theme })
      notifications.show({
        title: 'Saved',
        message: 'Theme updated',
        color: 'green',
      })
    } catch (error) {
      console.error('Failed to update theme:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to update settings',
        color: 'red',
      })
    }
  }

  if (!settings) {
    return <Text c="dimmed">Loading settings...</Text>
  }

  return (
    <Stack gap="lg">
      <Select
        label="Default Sort Order"
        description="How books are sorted when you open the app"
        data={SORT_OPTIONS}
        value={settings.defaultSortOrder}
        onChange={handleSortChange}
      />
      <Select
        label="Theme"
        description="Choose your preferred color scheme"
        data={THEME_OPTIONS}
        value={settings.theme}
        onChange={handleThemeChange}
      />
    </Stack>
  )
}
