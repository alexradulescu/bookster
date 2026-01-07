import { useState } from 'react'
import {
  Table,
  TextInput,
  ActionIcon,
  Group,
  Button,
  Text,
  Stack,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react'
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '../../hooks/useLocations'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

export function LocationsTab() {
  const locations = useLocations()
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const deleteLocation = useDeleteLocation()

  const [editingId, setEditingId] = useState<Id<'locations'> | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleStartEdit = (location: Doc<'locations'>) => {
    setEditingId(location._id)
    setEditValue(location.label)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return

    try {
      const result = await updateLocation({
        id: editingId,
        label: editValue.trim(),
      })

      if (result.success) {
        notifications.show({
          title: 'Saved',
          message: 'Location updated',
          color: 'green',
        })
        handleCancelEdit()
      } else {
        notifications.show({
          title: 'Error',
          message: result.message || 'Failed to update location',
          color: 'red',
        })
      }
    } catch (error) {
      console.error('Failed to update location:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to update location',
        color: 'red',
      })
    }
  }

  const handleDelete = async (id: Id<'locations'>) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const result = await deleteLocation({ id })

      if (result.success) {
        notifications.show({
          title: 'Deleted',
          message: 'Location removed',
          color: 'green',
        })
      }
    } catch (error) {
      console.error('Failed to delete location:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to delete location',
        color: 'red',
      })
    }
  }

  const handleAdd = async () => {
    if (!newLabel.trim()) return

    try {
      const result = await createLocation({ label: newLabel.trim() })

      if (result.success) {
        notifications.show({
          title: 'Added',
          message: 'Location created',
          color: 'green',
        })
        setNewLabel('')
        setIsAdding(false)
      } else {
        notifications.show({
          title: 'Error',
          message: result.message || 'Failed to create location',
          color: 'red',
        })
      }
    } catch (error) {
      console.error('Failed to create location:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to create location',
        color: 'red',
      })
    }
  }

  if (locations === undefined) {
    return <Text c="dimmed">Loading locations...</Text>
  }

  return (
    <Stack gap="md">
      {locations.length === 0 ? (
        <Text c="dimmed" ta="center" py="lg">
          No locations yet
        </Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Label</Table.Th>
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {locations.map((location: Doc<'locations'>) => (
              <Table.Tr key={location._id}>
                <Table.Td>
                  {editingId === location._id ? (
                    <TextInput
                      value={editValue}
                      onChange={(e) => setEditValue(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      autoFocus
                      styles={{ input: { fontSize: 16 } }}
                    />
                  ) : (
                    location.label
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {editingId === location._id ? (
                      <>
                        <ActionIcon
                          variant="subtle"
                          color="green"
                          onClick={handleSaveEdit}
                          disabled={!editValue.trim()}
                        >
                          <Check size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={handleCancelEdit}
                        >
                          <X size={16} />
                        </ActionIcon>
                      </>
                    ) : (
                      <>
                        <ActionIcon
                          variant="subtle"
                          onClick={() => handleStartEdit(location)}
                        >
                          <Pencil size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(location._id)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {isAdding ? (
        <Group gap="sm">
          <TextInput
            placeholder="New location name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewLabel('')
              }
            }}
            autoFocus
            style={{ flex: 1 }}
            styles={{ input: { fontSize: 16 } }}
          />
          <ActionIcon
            variant="filled"
            color="green"
            onClick={handleAdd}
            disabled={!newLabel.trim()}
          >
            <Check size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => {
              setIsAdding(false)
              setNewLabel('')
            }}
          >
            <X size={16} />
          </ActionIcon>
        </Group>
      ) : (
        <Button
          leftSection={<Plus size={16} />}
          variant="light"
          onClick={() => setIsAdding(true)}
        >
          Add Location
        </Button>
      )}
    </Stack>
  )
}
