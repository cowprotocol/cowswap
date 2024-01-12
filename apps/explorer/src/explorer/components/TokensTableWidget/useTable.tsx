import { useCallback, useState } from 'react'

export interface TableState {
  pageSize: number
  pageOffset: number
  pageIndex?: number
  hasNextPage?: boolean
  totalResults?: number
}

export interface TableOptions {
  initialState: TableState
}

export interface TableStateSetters {
  setPageOffset: (pageOffset: number) => void
  setPageSize: (pageSize: number) => void
  handleNextPage: () => void
  handlePreviousPage: () => void
}

type TableStateAndSetters = TableStateSetters & {
  state: TableState
}

/*
 * Calculate pageIndex from offsets through pageSize
 */
export const getPageIndex = (offset: number, limit: number): number =>
  offset > limit - 1 ? Math.ceil((offset + 1) / limit) : 1

export function useTable(options: TableOptions): TableStateAndSetters {
  const { initialState } = options
  const [state, setState] = useState({
    pageIndex: getPageIndex(initialState.pageOffset, initialState.pageSize),
    ...initialState,
  })

  const setPageSize = useCallback((newValue: number): void => {
    const offsetRestarted = 0
    setState((state) => ({
      ...state,
      pageSize: newValue,
      pageOffset: offsetRestarted,
      pageIndex: getPageIndex(offsetRestarted, newValue),
    }))
  }, [])

  const setPageOffset = useCallback((newOffset: number): void => {
    setState((state) => ({
      ...state,
      pageOffset: newOffset,
      pageIndex: getPageIndex(newOffset, state.pageSize),
    }))
  }, [])

  const handleNextPage = useCallback((): void => {
    const newOffset = state.pageOffset + state.pageSize
    setPageOffset(newOffset)
  }, [state, setPageOffset])

  const handlePreviousPage = useCallback((): void => {
    let newOffset = state.pageOffset - state.pageSize
    newOffset = newOffset < 0 ? 0 : newOffset
    setPageOffset(newOffset)
  }, [state, setPageOffset])

  return { state, setPageSize, setPageOffset, handleNextPage, handlePreviousPage }
}
