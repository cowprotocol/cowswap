import { useCallback, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react'

import { handleSelectComboboxKeyDown } from './selectCombobox.keydown'

import type { FormOption } from './Select.types'

export interface UseSelectComboboxKeyHandlerParams<T> {
  disabled: boolean | undefined
  isOpen: boolean
  filterQuery: string
  activeIndex: number
  options: FormOption<T>[]
  onChange: (value: T) => void
  setActiveIndex: Dispatch<SetStateAction<number>>
  setFilterQuery: Dispatch<SetStateAction<string>>
  openDropdown: () => void
  closeDropdown: () => void
  applyTypeahead: (char: string) => void
  beginTypeaheadFromClosed: (char: string) => void
  scheduleFilterReset: () => void
}

export function useSelectComboboxKeyHandler<T>({
  disabled,
  isOpen,
  filterQuery,
  activeIndex,
  options,
  onChange,
  setActiveIndex,
  setFilterQuery,
  openDropdown,
  closeDropdown,
  applyTypeahead,
  beginTypeaheadFromClosed,
  scheduleFilterReset,
}: UseSelectComboboxKeyHandlerParams<T>): (e: KeyboardEvent<HTMLButtonElement>) => void {
  return useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      handleSelectComboboxKeyDown(e, {
        disabled: !!disabled,
        isOpen,
        filterQuery,
        activeIndex,
        options,
        onChange,
        setActiveIndex,
        setFilterQuery,
        openDropdown,
        closeDropdown,
        applyTypeahead,
        beginTypeaheadFromClosed,
        scheduleFilterReset,
      })
    },
    [
      disabled,
      isOpen,
      filterQuery,
      activeIndex,
      options,
      onChange,
      setActiveIndex,
      setFilterQuery,
      openDropdown,
      closeDropdown,
      applyTypeahead,
      beginTypeaheadFromClosed,
      scheduleFilterReset,
    ],
  )
}
