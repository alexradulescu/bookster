import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useCategories() {
  const categories = useQuery(api.categories.list)
  return categories
}

export function useAllCategories() {
  const categories = useQuery(api.categories.listAll)
  return categories
}

export function useCreateCategory() {
  return useMutation(api.categories.create)
}

export function useUpdateCategory() {
  return useMutation(api.categories.update)
}

export function useDeleteCategory() {
  return useMutation(api.categories.remove)
}
