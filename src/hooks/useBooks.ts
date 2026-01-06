import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export function useBooks() {
  const books = useQuery(api.books.list)
  return books
}

export function useBook(id: Id<'books'> | undefined) {
  const book = useQuery(api.books.get, id ? { id } : 'skip')
  return book
}

export function useSearchBooks(term: string) {
  const books = useQuery(api.books.search, { term })
  return books
}

export function useAddBook() {
  return useMutation(api.books.add)
}

export function useAddBulkBooks() {
  return useMutation(api.books.addBulk)
}

export function useUpdateBook() {
  return useMutation(api.books.update)
}

export function useDeleteBook() {
  return useMutation(api.books.remove)
}
