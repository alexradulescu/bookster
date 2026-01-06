import { useState, useCallback } from 'react'
import { useDebouncedValue } from '@mantine/hooks'

interface UseSearchOptions {
  debounceMs?: number
  minLength?: number
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 150, minLength = 3 } = options
  const [searchValue, setSearchValue] = useState('')
  const [debouncedValue] = useDebouncedValue(searchValue, debounceMs)

  // Only return debounced value if it meets minimum length
  const effectiveSearchTerm =
    debouncedValue.length >= minLength ? debouncedValue : ''

  const clearSearch = useCallback(() => {
    setSearchValue('')
  }, [])

  return {
    searchValue,
    setSearchValue,
    debouncedSearchTerm: effectiveSearchTerm,
    clearSearch,
    isSearching: searchValue.length >= minLength,
  }
}
