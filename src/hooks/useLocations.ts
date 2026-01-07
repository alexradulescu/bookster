import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useLocations() {
  const locations = useQuery(api.locations.list)
  return locations
}

export function useAllLocations() {
  const locations = useQuery(api.locations.listAll)
  return locations
}

export function useCreateLocation() {
  return useMutation(api.locations.create)
}

export function useUpdateLocation() {
  return useMutation(api.locations.update)
}

export function useDeleteLocation() {
  return useMutation(api.locations.remove)
}
