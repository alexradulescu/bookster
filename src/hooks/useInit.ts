import { useQuery, useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'

export function useInitialization() {
  const isInitialized = useQuery(api.init.isInitialized)
  const createDefaults = useMutation(api.init.createDefaults)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only run once and only if not initialized
    if (isInitialized === false && !hasInitialized.current) {
      hasInitialized.current = true
      createDefaults()
    }
  }, [isInitialized, createDefaults])

  return { isInitialized: isInitialized ?? false, isLoading: isInitialized === undefined }
}
