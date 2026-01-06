import { createContext, useContext } from 'react'

export interface SearchStore {
  onPressEnter?: () => void
}

const SearchContext = createContext<SearchStore | null>(null)

export const SearchProvider = SearchContext.Provider

export function useSearchStore(): SearchStore {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearchStore must be used within SearchProvider')
  return ctx
}
