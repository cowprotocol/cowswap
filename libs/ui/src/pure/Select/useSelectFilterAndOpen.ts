import { useCallback, useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'

import { labelMatchesFilter, SELECT_FILTER_RESET_MS } from './selectCombobox.utils'

import type { FormOption } from './Select.types'

export interface UseSelectFilterAndOpenResult {
  isOpen: boolean
  activeIndex: number
  setActiveIndex: Dispatch<SetStateAction<number>>
  filterQuery: string
  setFilterQuery: Dispatch<SetStateAction<string>>
  filterResetRef: RefObject<ReturnType<typeof setTimeout> | null>
  scheduleFilterReset: () => void
  closeDropdown: () => void
  openDropdown: () => void
  applyTypeahead: (char: string) => void
  beginTypeaheadFromClosed: (char: string) => void
}

export function useSelectFilterAndOpen<T>(value: T, options: FormOption<T>[]): UseSelectFilterAndOpenResult {
  const filterResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [filterQuery, setFilterQuery] = useState('')

  const scheduleFilterReset = useCallback(() => {
    if (filterResetRef.current) clearTimeout(filterResetRef.current)
    filterResetRef.current = setTimeout(() => {
      setFilterQuery('')
      filterResetRef.current = null
    }, SELECT_FILTER_RESET_MS)
  }, [])

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    setFilterQuery('')
    if (filterResetRef.current) {
      clearTimeout(filterResetRef.current)
      filterResetRef.current = null
    }
  }, [])

  const openDropdown = useCallback(() => {
    const sel = options.findIndex((o) => o.value === value)
    setActiveIndex(sel >= 0 ? sel : 0)
    setIsOpen(true)
  }, [options, value])

  const applyTypeahead = useCallback(
    (char: string): void => {
      const nextQuery = filterQuery + char
      setFilterQuery(nextQuery)
      const first = options.findIndex((o) => labelMatchesFilter(o.label, nextQuery))
      if (first >= 0) setActiveIndex(first)
      scheduleFilterReset()
    },
    [filterQuery, options, scheduleFilterReset],
  )

  const beginTypeaheadFromClosed = useCallback(
    (char: string): void => {
      openDropdown()
      setFilterQuery(char)
      const first = options.findIndex((o) => labelMatchesFilter(o.label, char))
      const sel = options.findIndex((o) => o.value === value)
      let nextActive = 0
      if (first >= 0) nextActive = first
      else if (sel >= 0) nextActive = sel
      setActiveIndex(nextActive)
      scheduleFilterReset()
    },
    [openDropdown, options, value, scheduleFilterReset],
  )

  useEffect(() => {
    return () => {
      if (filterResetRef.current !== null) {
        clearTimeout(filterResetRef.current)
      }
    }
  }, [filterResetRef])

  return {
    isOpen,
    activeIndex,
    setActiveIndex,
    filterQuery,
    setFilterQuery,
    filterResetRef,
    scheduleFilterReset,
    closeDropdown,
    openDropdown,
    applyTypeahead,
    beginTypeaheadFromClosed,
  }
}
