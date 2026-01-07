import { useQuery, useMutation } from 'convex/react'
import { useEffect, useRef, useCallback } from 'react'
import { api } from '../../convex/_generated/api'

export function useInitialization() {
  const isInitialized = useQuery(api.init.isInitialized)
  const createDefaultsMutation = useMutation(api.init.createDefaults)
  const hasInitialized = useRef(false)

  // Memoize the init function to prevent dependency changes
  const initializeDefaults = useCallback(async () => {
    try {
      await createDefaultsMutation()
    } catch (error) {
      console.error('Failed to initialize default data:', error)
      // Reset flag so it can retry on next render
      hasInitialized.current = false
    }
  }, [createDefaultsMutation])

  useEffect(() => {
    // Only run once and only if not initialized
    if (isInitialized === false && !hasInitialized.current) {
      hasInitialized.current = true
      initializeDefaults()
    }
  }, [isInitialized, initializeDefaults])

  return { isInitialized: isInitialized ?? false, isLoading: isInitialized === undefined }
}
