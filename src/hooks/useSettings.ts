import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useSettings() {
  const settings = useQuery(api.settings.get)
  return settings
}

export function useUpdateSettings() {
  return useMutation(api.settings.update)
}
