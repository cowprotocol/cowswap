import usePrevious from 'hooks/usePrevious'
import { createContext, useContext, useEffect, useState } from 'react'

interface UsePaginationParams {
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  prevQuery: string
  query: string
  maxItems: number
  amount: number
}

interface UsePaginationResult {
  prevPage: number
  nextPage: number
  prevPageIndex: number | undefined
  maxPage: number
  page: number
  setPage: (page: number) => void
}

export const PaginationContext = createContext<UsePaginationResult>({
  prevPage: 1,
  nextPage: 1,
  prevPageIndex: undefined,
  maxPage: 1,
  page: 1,
  setPage: () => {},
})

export function usePagination({
  page,
  setPage,
  prevQuery,
  query,
  maxItems,
  amount,
}: UsePaginationParams): UsePaginationResult {
  const [maxPage, setMaxPage] = useState(1)
  const prevPageIndex = usePrevious(page)
  const prevPage = page === 1 ? page : page - 1
  const nextPage = page === maxPage ? page : page + 1

  // reset pagination when user is in a page > 1, searching and deletes query
  useEffect(() => {
    // already on page 1, ignore
    if (page === 1) return

    // if there was some query and user deletes it
    // reset page
    if (!!prevQuery && !query) {
      setPage(1)
    }
  }, [query, page, setPage, prevQuery])

  useEffect(() => {
    let extraPages = 1
    if (amount) {
      if (amount % maxItems === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(amount / maxItems) + extraPages)
    }
  }, [maxItems, amount])

  return {
    prevPage,
    nextPage,
    prevPageIndex,
    maxPage,
    page,
    setPage,
  }
}

export function usePaginationContext() {
  return useContext(PaginationContext)
}
