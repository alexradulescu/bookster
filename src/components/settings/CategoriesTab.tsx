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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

export function CategoriesTab() {
  const categories = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [editingId, setEditingId] = useState<Id<'categories'> | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleStartEdit = (category: Doc<'categories'>) => {
    setEditingId(category._id)
    setEditValue(category.label)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return

    try {
      const result = await updateCategory({
        id: editingId,
        label: editValue.trim(),
      })

      if (result.success) {
        notifications.show({
          title: 'Saved',
          message: 'Category updated',
          color: 'green',
        })
        handleCancelEdit()
      } else {
        notifications.show({
          title: 'Error',
          message: result.message || 'Failed to update category',
          color: 'red',
        })
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to update category',
        color: 'red',
      })
    }
  }

  const handleDelete = async (id: Id<'categories'>) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const result = await deleteCategory({ id })

      if (result.success) {
        notifications.show({
          title: 'Deleted',
          message: 'Category removed',
          color: 'green',
        })
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to delete category',
        color: 'red',
      })
    }
  }

  const handleAdd = async () => {
    if (!newLabel.trim()) return

    try {
      const result = await createCategory({ label: newLabel.trim() })

      if (result.success) {
        notifications.show({
          title: 'Added',
          message: 'Category created',
          color: 'green',
        })
        setNewLabel('')
        setIsAdding(false)
      } else {
        notifications.show({
          title: 'Error',
          message: result.message || 'Failed to create category',
          color: 'red',
        })
      }
    } catch (error) {
      console.error('Failed to create category:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to create category',
        color: 'red',
      })
    }
  }

  if (categories === undefined) {
    return <Text c="dimmed">Loading categories...</Text>
  }

  return (
    <Stack gap="md">
      {categories.length === 0 ? (
        <Text c="dimmed" ta="center" py="lg">
          No categories yet
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
            {categories.map((category: Doc<'categories'>) => (
              <Table.Tr key={category._id}>
                <Table.Td>
                  {editingId === category._id ? (
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
                    category.label
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {editingId === category._id ? (
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
                          onClick={() => handleStartEdit(category)}
                        >
                          <Pencil size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(category._id)}
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
            placeholder="New category name"
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
          Add Category
        </Button>
      )}
    </Stack>
  )
}
