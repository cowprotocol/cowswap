import { useCallback, type Dispatch, type FocusEvent, type MouseEvent, type SetStateAction } from 'react'

import type { FormOption } from './Select.types'

export interface UseSelectComboboxActionsParams<T> {
  disabled: boolean | undefined
  isOpen: boolean
  options: FormOption<T>[]
  onChange: (value: T) => void
  closeDropdown: () => void
  openDropdown: () => void
  setActiveIndex: Dispatch<SetStateAction<number>>
}

export interface UseSelectComboboxActionsResult {
  handleButtonClick: () => void
  handleButtonBlur: (e: FocusEvent<HTMLButtonElement>) => void
  handleOptionClick: (e: MouseEvent<HTMLDivElement>) => void
  handleOptionMouseEnter: (index: number) => void
}

export function useSelectComboboxActions<T>({
  disabled,
  isOpen,
  options,
  onChange,
  closeDropdown,
  openDropdown,
  setActiveIndex,
}: UseSelectComboboxActionsParams<T>): UseSelectComboboxActionsResult {
  const handleButtonClick = useCallback(() => {
    if (disabled) return
    if (isOpen) {
      closeDropdown()
    } else {
      openDropdown()
    }
  }, [disabled, isOpen, closeDropdown, openDropdown])

  const handleButtonBlur = useCallback(
    (e: FocusEvent<HTMLButtonElement>) => {
      const next = e.relatedTarget
      if (next instanceof Node && e.currentTarget.contains(next)) return
      closeDropdown()
    },
    [closeDropdown],
  )

  const handleOptionClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const idxStr = e.currentTarget.dataset.optionIndex
      const idx = idxStr === undefined ? NaN : Number.parseInt(idxStr, 10)
      const option = Number.isFinite(idx) ? options[idx] : undefined
      if (!option) return
      onChange(option.value)
      closeDropdown()
    },
    [onChange, options, closeDropdown],
  )

  const handleOptionMouseEnter = useCallback(
    (index: number) => {
      setActiveIndex(index)
    },
    [setActiveIndex],
  )

  return {
    handleButtonClick,
    handleButtonBlur,
    handleOptionClick,
    handleOptionMouseEnter,
  }
}
