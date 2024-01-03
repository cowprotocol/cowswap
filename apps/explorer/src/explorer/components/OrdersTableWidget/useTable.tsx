import { useState } from 'react'

export interface TableState {
  pageSize: number
  pageOffset: number
  pageIndex?: number
  hasNextPage?: boolean
}

export interface TableOptions {
  initialState: TableState
}

export interface TableStateSetters {
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

  const setPageSize = (newValue: number): void => {
    const offsetRestarted = 0
    setState({
      ...state,
      pageSize: newValue,
      pageOffset: offsetRestarted,
      pageIndex: getPageIndex(offsetRestarted, newValue),
    })
  }

  const setPageOffset = (newOffset: number): void => {
    setState({
      ...state,
      pageOffset: newOffset,
      pageIndex: getPageIndex(newOffset, state.pageSize),
    })
  }

  const handleNextPage = (): void => {
    const newOffset = state.pageOffset + state.pageSize
    setPageOffset(newOffset)
  }

  const handlePreviousPage = (): void => {
    let newOffset = state.pageOffset - state.pageSize
    newOffset = newOffset < 0 ? 0 : newOffset
    setPageOffset(newOffset)
  }

  return { state, setPageSize, handleNextPage, handlePreviousPage }
}
